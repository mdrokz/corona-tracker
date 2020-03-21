import Head from 'next/head'
import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Component } from 'react';
import ReactTooltip from "react-tooltip";
import { CoronaData, MapData, groupData } from '../types/coronaData';
//import * as _ from "lodash";
import _ from "lodash";
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear()
  .domain([0.29, 0.68])
  .range(["#ffedea", "#ff5233"]);

class Home extends Component {
  cData: CoronaData;
  coronaScraper: typeof import("d:/md/my-files/react-projects/corona-tracker/wasm/index");
  mapData: Map<string, MapData> = new Map();
  groupData: groupData[];
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
            RecoveryInPercent: _.sumBy(value, (v) => parseInt(String(parseFloat(v.Confirmed) / parseFloat(v.Recovered)))),
            Data: value
          }))
        .value();
    this.groupData.forEach(c => this.mapData.set(c.Country, { Confirmed: c.Confirmed, Deaths: c.Deaths, Recovered: c.Recovered, RecoveryInPercent: c.RecoveryInPercent }))
    console.log(this.mapData);
  }
  state = { tooltipName: "" };
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
                //const d = data.rawData.find(s => s.ISO3 === geo.properties.ISO_A3);
                //console.log(d);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const { NAME, POP_EST } = geo.properties;
                      //debugger;

                      let data = this.mapData.get(NAME);
                      if (data != undefined) {

                        console.log(this.mapData[NAME]);
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
                    style={{
                      default: {
                        fill: "#D6D6DA",
                        outline: "none"
                      },
                      hover: {
                        fill: "#F53",
                        outline: "none"
                      },
                      pressed: {
                        fill: "#E42",
                        outline: "none"
                      }
                    }}
                    fill={"#F5F4F6"}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </main>
      <ReactTooltip>{this.state.tooltipName}</ReactTooltip>
    </div>);
  }
};

export default Home
