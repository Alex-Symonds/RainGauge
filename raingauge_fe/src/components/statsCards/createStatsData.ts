/*
    Performs calculations and formats the data for use in the "stats cards"
*/

import { formatDate } from "@/util/dateStringHelpers";
import { T_RainGaugeReading } from "@/util/useRainGaugeData";
import { T_StatsCardProps } from "./StatsCard";

type T_StatsAccumulator = {
    total: number,
    min: number,
    max: number,
}

export type T_StatsDataOutput = null | T_StatsCardProps[];

export function createStatsData(filteredData : T_RainGaugeReading[]) : T_StatsDataOutput{

    const READINGS_PER_DAY = 4 * 24;

    if(filteredData.length === 0){
        return null;
    }

    const stats = filteredData.reduce((acc : T_StatsAccumulator, curr : T_RainGaugeReading) => {
        return {
            total: acc.total + parseFloat(curr.reading),
            max: Math.max(acc.max, parseFloat(curr.reading)),
            min: Math.min(acc.min, parseFloat(curr.reading)),
        }
    }, { total: 0, min: Infinity, max: -Infinity });

    const totalObj = {
        title: "Total",
        main: formatWithMM(stats.total),
        subtitle: `${filteredData.length.toLocaleString()} readings over ${ Math.round(filteredData.length/READINGS_PER_DAY) } days`
    }

    const numAtMax = filteredData.filter(record => parseFloat(record.reading) === stats.max).length;
    const maxDate = filteredData.find(record => parseFloat(record.reading) === stats.max);
    const maxObj = {
        title: "High",
        main: formatWithMM(stats.max),
        subtitle: numAtMax === 1
            ? maxDate === undefined ? "" : formatDate(maxDate.timestamp)
            : createMinMaxSubtitle(numAtMax)
    }

    const numAtMin = filteredData.filter(record => parseFloat(record.reading) === stats.min).length;
    const minDate = filteredData.find(record => parseFloat(record.reading) === stats.min);
    const minObj = {
        title: "Low",
        main: formatWithMM(stats.min),
        subtitle: numAtMin === 1
            ? minDate === undefined ? "" : formatDate(minDate.timestamp)
            : createMinMaxSubtitle(numAtMin)
    }

    const averageObj = {
        title: "Average",
        main: filteredData.length === 0 ? formatWithMM(0) : formatWithMM(stats.total / filteredData.length),
        subtitle: "per 15 mins"
    }

    function formatWithMM(num : number){
        return `${Math.round(num * 100) / 100} mm`;
    }

    function createMinMaxSubtitle(num : number){
        return `Occurred ${num.toLocaleString()} times`
    }

    return [totalObj, maxObj, minObj, averageObj];
}
