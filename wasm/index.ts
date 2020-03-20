import { CoronaData } from './../types/coronaData';
import * as wasm from "corona-scraper";


export async function getCoronaData(): Promise<CoronaData> {
    let data: CoronaData;
    let ob = wasm.getCoronaData();
    // ob.then((res: string) => {
    //     debugger;
    //     data = JSON.parse(res);
    //     return data;
    // }).catch(err => console.error(err));
    let json:string = await ob;
    data = JSON.parse(json);
    return data;

}