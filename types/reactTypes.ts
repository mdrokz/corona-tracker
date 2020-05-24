import { MapData, CoronaData } from "./coronaData";

export interface contextData {
    leftOpen: boolean,
    index?: number
}

export interface mapProps {
    colorScale: Function,
    mapData: Map<string, MapData>,
    setIndex: Function,
    isMobile: boolean,
    cData: CoronaData[]
}

export interface WhoData {
    get_header(index: number): Uint8Array
    get_paragraph(index: number): Uint8Array
    get_bytes_length(index: number,p_index:number): number[]
    get_length(index: number): number[]
}