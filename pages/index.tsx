import Head from 'next/head'

import MouseTooltip from '../components/MouseTooltip';
import { initGA, logPageView } from "../components/googleAnalytics";

import React from 'react';

import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { CoronaData, MapData, groupData } from '../types/coronaData';
import _ from "lodash";
import SideBar from '../components/sidebar';
import { contextData, mapProps } from '../types/reactTypes';
import { GetServerSideProps } from 'next';
import { Button, CircularProgress } from '@material-ui/core';
import { CardModal } from '../components/cards';

declare global {
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
// const rContext = React.createContext<contextData>({ leftOpen: false, index: 0 });
var colorScale: Function = null;

function GeoMap(props: mapProps) {
  let [toolTipName, usetoolTip] = React.useState<string>();
  let [country, useCountry] = React.useState<string>();
  let [show, setShow] = React.useState<boolean>();
  let ismobile = props.isMobile;
  return (
    <>
      <ComposableMap
        top={80}
        left={0}
        className="map"
        id="my-portal-root"
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 100,
        }}
      >
        <Sphere stroke="#E4E5E6" strokeWidth={0.7} />
        <Graticule stroke="#E4E5E6" strokeWidth={0.7} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              return (

                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(evt) => {
                    const { NAME, ISO_A2 } = geo.properties;

                    let data = props.mapData.get(ISO_A2);
                    if (data != undefined) {
                      let tooltip = `${NAME} - \nConfirmed: ${data.Confirmed}\n Recovered: ${data.Recovered}\n Deaths: ${data.Deaths}`;
                      usetoolTip(tooltip);
                    } else {
                      usetoolTip(NAME);
                    }
                    setShow(true);
                  }}
                  onMouseDown={() => {
                    const { ISO_A2 } = geo.properties;
                    if (!ismobile) {
                      props.setIndex({ leftOpen: true, index: props.mapData.get(ISO_A2).index });
                    } else {
                      useCountry(ISO_A2);
                    }
                  }}
                  onMouseLeave={() => {
                    usetoolTip("");
                    setShow(false);
                  }}
                  style={{
                    default: {
                      // fill: "#D6D6DA",
                      outline: "none"
                    },
                    hover: {
                      //fill: "#F53",
                      outline: "none",
                      cursor: "pointer"
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none",
                      cursor: "pointer"
                    }
                  }}
                  fill={props.colorScale != null ? props.colorScale(props.mapData.get(geo.properties.ISO_A2) ? props.mapData.get(geo.properties.ISO_A2).colorValue : "#EEE") : "#EEE"} //"#F5F4F6"}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {!ismobile && <MouseTooltip
        visible={show}
        offsetX={0}
        offsetY={10}
      >
        <div className="con-tooltip top">
          <p>{toolTipName}</p>
          <div className="tooltip">
          </div>
        </div>
      </MouseTooltip>}
      {ismobile && <CardModal isMobile={ismobile} open={show} infected={country ? props.cData[props.mapData.get(country).index] : null} selected={'Infection'}></CardModal>}
    </>);
}

//var window: any;

class Home extends React.PureComponent {
  cData: CoronaData[];
  coronaScraper: typeof import("../wasm/index");
  mapData: Map<string, MapData> = new Map();
  groupData: groupData[];

  // isMobile = () => {
  //   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  // }

  getGroupData() {
    if (this.cData) {
      this.groupData =
        _.chain(this.cData)
          // Group the elements of Array based on `color` property
          .groupBy("countryInfo.iso2")
          // `key` is group's name (color), `value` is the array of objects
          .map((value, key) => (
            {
              Iso2: key,
              Confirmed: _.sumBy(value, (v) => (v.cases)),
              Recovered: _.sumBy(value, (v) => (v.recovered)),
              Deaths: _.sumBy(value, (v) => (v.deaths)),
              Data: value
            }))
          .value();
      let maxConfirmed = _.max(this.groupData.map(m => m.Confirmed));
      this.groupData = this.groupData.map(d => {
        d.RecoveryInPercent = ((d.Recovered / d.Confirmed) * 100).toFixed(2);
        d.colorValue = ((d.Confirmed / maxConfirmed) * 100).toFixed(2);
        return d;
      })
    }
  }

  async componentDidMount() {
    // if (!window.GA_INITIALIZED) {
    //   initGA();
    //   window.GA_INITIALIZED = true;
    // }
    // logPageView();

    import("../wasm/index").then(res => {
      this.coronaScraper = res;
      this.setState({ isLoading: true })
      try {
        this.coronaScraper.getCoronaData().then(data => {
          this.cData = data;
          this.getGroupData();
          this.groupData.forEach((c, i) => this.mapData.set(c.Iso2, { Confirmed: c.Confirmed, Deaths: c.Deaths, Recovered: c.Recovered, RecoveryInPercent: c.RecoveryInPercent, colorValue: c.colorValue, index: i }))
          colorScale =
            scaleQuantile()
              .domain(this.groupData.map(d => d.colorValue))
              .range([
                "#ffedea", // 1
                "#ffcec5", // 2
                "#ffad9f", // 3
                "#ff8a75", // 4
                "#ff5533", // 5
                "#e2492d", // 6
                "#be3d26", // 7
                "#9a311f", // 8
                "#782618"  // 9
              ]);
          this.setState({ colorScale: colorScale, mapData: this.mapData });
        }).finally(() => this.setState({ isLoading: false,getWhoNews: this.coronaScraper.getWhoNews }));
      } catch (e) {
        console.error(e);
      }

      // c.Country == "USA" ? "United States of America" : c.Country

    });
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.setState({ isMobile: true })
    }


  }
  state = { colorScale: null, pData: { leftOpen: null, index: null }, isMobile: false, mapData: new Map<string, MapData>(), isLoading: false,getWhoNews: null };
  constructor(props) {
    super(props);
  }

  getIndex = (coData: contextData) => {
    this.setState({ pData: coData });
  }

  clearIndex = () => {
    this.setState({ pData: { leftOpen: null, index: null } })
  }

  render() {
    return (<div className={`container`}>
      <Head>
        <title>Covid-19 Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <h1 className="c_header">Covid-19 Tracker By Mdrokz</h1> */}
      {/* <CircularProgress className="home-progress" size={68} /> */}
      {this.state.isLoading && <CircularProgress className="home-progress" size={100} />}
      {!this.state.isLoading &&
        <SideBar cData={this.cData} ctxData={this.state.pData} clearIndex={this.clearIndex} getWhoNews={this.state.getWhoNews ? this.state.getWhoNews : null}>
          <GeoMap colorScale={this.state.colorScale} mapData={this.state.mapData} setIndex={this.getIndex} isMobile={this.state.isMobile} cData={this.cData}></GeoMap>
        </SideBar>
      }
    </div >);
  }
};
export default Home

