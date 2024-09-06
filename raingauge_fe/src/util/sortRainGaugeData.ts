import { T_RainGaugeSubtotal } from "./useRainGaugeData";

export function sortSubtotalsInDateOrder(data : T_RainGaugeSubtotal[]){
    return data.toSorted((a : T_RainGaugeSubtotal, b : T_RainGaugeSubtotal) => {
        const aDate = new Date(a.lastTimestamp).valueOf();
        const bDate = new Date(b.lastTimestamp).valueOf();
        return aDate - bDate;
    })
}