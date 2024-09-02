/*
    Takes an array of rain gauge readings and splits it into separate arrays of 
    timestamp and reading, for use in a Plotly graph
*/

import { T_RainGaugeReading } from "./useRainGaugeData";

export function splitIntoCoords(data : T_RainGaugeReading[]){
    let xCoords = ["01/01/1900T00:00"];
    let yCoords = [0];

    if(data !== undefined && data !== null && data.length !== 0){
        xCoords = data.map((record : T_RainGaugeReading) => record.timestamp);
        yCoords = data.map((record : T_RainGaugeReading) => parseFloat(record.reading));
    }
    return {
        xCoords,
        yCoords,
    }
}