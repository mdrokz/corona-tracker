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

declare global {
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
const rContext = React.createContext<contextData>({ leftOpen: null, index: 0 });
var colorScale: Function = null;
var b = false;

function GeoMap(props: mapProps) {
  let [toolTipName, usetoolTip] = React.useState<string>();
  let [show, setShow] = React.useState<boolean>();
  return (
    <>
      <ComposableMap
        top={60}
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
                    b = !b
                    props.setIndex({ leftOpen: b, index: props.mapData.get(ISO_A2).index });
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
      <MouseTooltip
        visible={show}
        offsetX={0}
        offsetY={10}
      >
        <div className="con-tooltip top">
          <p>{toolTipName}</p>
          <div className="tooltip ">
          </div>
        </div>
      </MouseTooltip>
    </>);
}

//var window: any;

class Home extends React.Component {
  cData: CoronaData[];
  coronaScraper: typeof import("../wasm/index");
  mapData: Map<string, MapData> = new Map();
  groupData: groupData[];

  async componentDidMount() {
    // if (!window.GA_INITIALIZED) {
    //   initGA();
    //   window.GA_INITIALIZED = true;
    // }
    // logPageView();

    this.coronaScraper = await import("../wasm/index");
    try {
      this.cData = await this.coronaScraper.getCoronaData();
      console.log(this.cData);
    } catch (e) {
      console.error(e);
    }

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
      // c.Country == "USA" ? "United States of America" : c.Country
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
      this.setState({ colorScale: colorScale });
    }
  }
  state = { colorScale: null, pData: { leftOpen: null, index: 0 } };
  constructor(props) {
    super(props);
  }

  getIndex = (coData: contextData) => {
    this.setState({ pData: coData });
  }

  render() {
    return (<div className="container">
      <Head>
        <title>Covid-19 Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <h1 className="c_header">Covid-19 Tracker By Mdrokz</h1> */}
      <rContext.Provider value={this.state.pData}>
        <SideBar cData={this.cData} rContext={rContext}>
          <GeoMap colorScale={this.state.colorScale} mapData={this.mapData} setIndex={this.getIndex}></GeoMap>
        </SideBar>
      </rContext.Provider>
    </div >);
  }
};

export default Home
