import Head from 'next/head'

import React from 'react';

import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import ReactTooltip from 'react-tooltip'
import { CoronaData, MapData, groupData } from '../types/coronaData';
import _ from "lodash";
import SideBar from '../components/sidebar';
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
var colorScale: any = null;

class Home extends React.Component {
  cData: CoronaData;
  coronaScraper: typeof import("d:/md/my-files/react-projects/corona-tracker/wasm/index");
  mapData: Map<string, MapData> = new Map();
  groupData: groupData[];
  //colorScale: any;
  async componentWillMount() {
    this.coronaScraper = await import("../wasm/index");
    this.cData = await this.coronaScraper.getCoronaData();

    this.groupData =
      _.chain(this.cData.rawData)
        // Group the elements of Array based on `color` property
        .groupBy("Country/Region")
        // `key` is group's name (color), `value` is the array of objects
        .map((value, key) => (
          {
            Country: key,
            Confirmed: _.sumBy(value, (v) => parseFloat(v.Confirmed || '0')),
            Recovered: _.sumBy(value, (v) => parseFloat(v.Recovered || '0')),
            Deaths: _.sumBy(value, (v) => parseFloat(v.Deaths || '0')),
            Data: value
          }))
        .value();
    let maxConfirmed = _.max(this.groupData.map(m => m.Confirmed));
    this.groupData = this.groupData.map(d => {
      d.RecoveryInPercent = ((d.Recovered / d.Confirmed) * 100).toFixed(2);
      d.colorValue = ((d.Confirmed / maxConfirmed) * 100).toFixed(2);
      return d;
    })
    this.groupData.forEach(c => this.mapData.set(c.Country == "US" ? "United States of America" : c.Country, { Confirmed: c.Confirmed, Deaths: c.Deaths, Recovered: c.Recovered, RecoveryInPercent: c.RecoveryInPercent, colorValue: c.colorValue }))
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
      {/* <SideBar /> */}
      <main>
        <ComposableMap
          data-tip=""
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 127
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

                      let data = this.mapData.get(NAME);
                      if (data != undefined) {
                        let tooltip = `${NAME} - \nConfirmed: ${data.Confirmed}\n Recovered: ${data.Recovered}\n Deaths: ${data.Deaths}`;
                        this.setState({ tooltipName: tooltip })
                        console.log(this.mapData.get(NAME));
                      } else {
                        this.setState({ tooltipName: NAME })
                      }
                    }}
                    onMouseLeave={() => {
                      this.setState({ tooltipName: "" });
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
                    fill={this.state.colorScale != null ? this.state.colorScale(this.mapData.get(geo.properties.NAME) ? this.mapData.get(geo.properties.NAME).colorValue : "#EEE") : "#EEE"} //"#F5F4F6"}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </main>
      <ReactTooltip>{this.state.tooltipName}</ReactTooltip>
    </div >);
  }
};

export default Home
