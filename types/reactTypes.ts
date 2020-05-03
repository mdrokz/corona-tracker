import { MapData } from "./coronaData";

export interface contextData {
    leftOpen: boolean,
    index?: number
}

export interface mapProps {
    colorScale: Function,
    mapData: Map<string, MapData>,
    setIndex: Function
}