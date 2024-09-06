/*
    Takes an array of rain gauge subtotals and splits it into separate arrays of 
    timestamps and reading, for use in a Plotly graph
*/

import { T_RainGaugeSubtotal } from "./useRainGaugeData";

export function splitSubtotalIntoCoords(data : T_RainGaugeSubtotal[]){
    let xCoords = ["01/01/1900T00:00"];
    let yCoords = [0];

    if(data !== undefined && data !== null && data.length !== 0){
        xCoords = data.map((record : T_RainGaugeSubtotal) => record.lastTimestamp);
        yCoords = data.map((record : T_RainGaugeSubtotal) => parseFloat(record.total));
    }
    return {
        xCoords,
        yCoords,
    }
}