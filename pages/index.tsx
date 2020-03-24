import Head from 'next/head'

import React from 'react';

import 'react-tippy/dist/tippy.css';

import {
  Tooltip,
} from 'react-tippy';

import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import ReactTooltip from 'react-tooltip';
import { CoronaData, MapData, groupData } from '../types/coronaData';
import _ from "lodash";
import SideBar from '../components/sidebar';
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
var colorScale: any = null;

function GeoMap(props) {
  let [toolTipName, usetoolTip] = React.useState<string>();
  return (
    <>
      <ComposableMap
        className="map"
        data-tip=""
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 100
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
                  onMouseEnter={() => {
                    const { NAME, POP_EST } = geo.properties;

                    let data = props.mapData.get(NAME);
                    if (data != undefined) {
                      let tooltip = `${NAME} - \nConfirmed: ${data.Confirmed}\n Recovered: ${data.Recovered}\n Deaths: ${data.Deaths}`;
                      usetoolTip(tooltip);
                    } else {
                      usetoolTip(NAME);
                    }
                  }}
                  onMouseLeave={() => {
                    usetoolTip("");
                  }}
                  // style={{
                  //   default: {
                  //     fill: "#D6D6DA",
                  //     outline: "none"
                  //   },
                  //   // hover: {
                  //   //   fill: "#F53",
                  //   //   outline: "none"
                  //   // },
                  //   // pressed: {
                  //   //   fill: "#E42",
                  //   //   outline: "none"
                  //   // }
                  // }}
                  fill={props.colorScale != null ? props.colorScale(props.mapData.get(geo.properties.NAME) ? props.mapData.get(geo.properties.NAME).colorValue : "#EEE") : "#EEE"} //"#F5F4F6"}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <ReactTooltip>{toolTipName}</ReactTooltip>
    </>);
}

class Home extends React.Component {
  cData: CoronaData[];
  coronaScraper: typeof import("../wasm/index");
  mapData: Map<string, MapData> = new Map();
  groupData: groupData[];
  async componentDidMount() {
    this.coronaScraper = await import("../wasm/index");
    try {
      this.cData = await this.coronaScraper.getCoronaData();
    } catch (e) {
      console.log(e);
    }

    if (this.cData) {
      this.groupData =
        _.chain(this.cData)
          // Group the elements of Array based on `color` property
          .groupBy("country")
          // `key` is group's name (color), `value` is the array of objects
          .map((value, key) => (
            {
              Country: key,
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
      this.groupData.forEach(c => this.mapData.set(c.Country == "USA" ? "United States of America" : c.Country, { Confirmed: c.Confirmed, Deaths: c.Deaths, Recovered: c.Recovered, RecoveryInPercent: c.RecoveryInPercent, colorValue: c.colorValue }))
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
            "#782618" // 9
          ]);
      this.setState({ colorScale: colorScale });
      console.log(this.mapData);
    }
  }
  state = { tooltipName: "", colorScale: null };
  constructor(props) {
    super(props);
    console.log(this.state);
  }

  render() {
    return (<div className="container">

      <Head>
        <title>Corona Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBar>
        <Tooltip
          // options
          title="Welcome to React"
          position="bottom"
          trigger="mouseenter"
        >
          <GeoMap colorScale={this.state.colorScale} mapData={this.mapData}></GeoMap>
        </Tooltip>
      </SideBar>
    </div >);
  }
};

export default Home
