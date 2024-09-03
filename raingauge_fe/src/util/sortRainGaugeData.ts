import { T_RainGaugeReading } from "./useRainGaugeData";

export function sortInDateOrder(data : T_RainGaugeReading[]){
    return data.toSorted((a : T_RainGaugeReading, b : T_RainGaugeReading) => {
        const aDate = new Date(a.timestamp).valueOf();
        const bDate = new Date(b.timestamp).valueOf();
        return aDate - bDate;
    })
}