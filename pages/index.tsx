import Head from 'next/head'
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import {scaleLinear} from "d3-scale";
import("../wasm/index")
  .then(res => console.log(res.getCoronaData().then(ress => console.log(ress))))
  .catch(e => console.error("Error importing `index.js`:", e));

const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const Home = () => (
  <div className="container">
    <Head>
      <title>Corona Tracker</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} />)
          }
        </Geographies>
      </ComposableMap>
    </main>
  </div>
)

export default Home
