/*
    Performs calculations and formats the data for use in the "stats cards"
*/

import { formatDate } from "@/util/dateStringHelpers";
import { T_RainGaugeSubtotal, T_RainGaugeSubtotalMinMax } from "@/util/useRainGaugeData";
import { T_StatsCardProps } from "./StatsCard";

export type T_StatsDataOutput = T_StatsCardProps[];

type T_RainGaugeSubtotalMinMaxProcessed = {
    count : number,
    timestamp : Date | null,
    reading: number,
}


type T_StatsAccumulator = {
    total : number,
    min : T_RainGaugeSubtotalMinMaxProcessed,
    max : T_RainGaugeSubtotalMinMaxProcessed,
    numReadings : number,
}


export function createStatsData(filteredData : T_RainGaugeSubtotal[], numReadingsPerHour : number) : T_StatsDataOutput{
    const FALLBACK_STATS = { 
        total: 0, 
        max: { 
            reading: 0, 
            count: 0, 
            timestamp: null 
        }, 
        min: { 
            reading: 0, 
            count: 0, 
            timestamp: null 
        }, 
        numReadings: 0 
    };

    const stats = filteredData.length === 0
        ? FALLBACK_STATS
        : calculateStats(filteredData);

    return formatStats(stats, numReadingsPerHour);
}


function calculateStats(filteredData : T_RainGaugeSubtotal[]){
    return filteredData.reduce((acc : T_StatsAccumulator, curr : T_RainGaugeSubtotal) => {
        const newMax = getNewMinMaxObject(acc.max, curr.max, parseFloat(curr.max.reading) > acc.max.reading);
        const newMin = getNewMinMaxObject(acc.min, curr.min, parseFloat(curr.min.reading) < acc.min.reading);

        return {
            total: acc.total + parseFloat(curr.total),
            max: newMax,
            min: newMin,
            numReadings: acc.numReadings + parseFloat(curr.numReadings),
        }
    }, { total: 0, numReadings: 0, min: { reading: Infinity, count: 0, timestamp: null }, max: { reading: -Infinity, count: 0, timestamp: null } });


    function getNewMinMaxObject(accMinMax : T_RainGaugeSubtotalMinMaxProcessed, currMinMax : T_RainGaugeSubtotalMinMax, wantReplace : boolean){
        let count, reading, timestamp;

        if(wantReplace){
            count = 1;
            reading = parseFloat(currMinMax.reading);
            timestamp = new Date(currMinMax.timestamp);
        }
        else if(accMinMax.reading === parseFloat(currMinMax.reading)){
            count = accMinMax.count + parseFloat(currMinMax.count)
            reading = accMinMax.reading;
            timestamp = null;
        }
        else {
            count = accMinMax.count;
            reading = accMinMax.reading;
            timestamp = accMinMax.timestamp
        }

        return { count, reading, timestamp }
    }
}


function formatStats(stats : T_StatsAccumulator, numReadingsPerHour : number){
    const READINGS_PER_DAY = numReadingsPerHour * 24;

    const numDays = Math.round(stats.numReadings/READINGS_PER_DAY);

    const totalObj = {
        title: "Total",
        main: formatWithMM(stats.total),
        subtitle: `${stats.numReadings.toLocaleString()} readings over ${ numDays } day${ numDays === 1 ? "" : "s"}`
    }

    const maxObj = {
        title: "High",
        main: formatWithMM(stats.max.reading),
        subtitle: stats.max.count === 1
            ? stats.max.timestamp === null ? "" : formatDate(stats.max.timestamp)
            : createMinMaxSubtitle(stats.max.count),
    }

    const minObj = {
        title: "Low",
        main: formatWithMM(stats.min.reading),
        subtitle: stats.min.count === 1
            ? stats.min.timestamp === null ? "" : formatDate(stats.min.timestamp)
            : createMinMaxSubtitle(stats.min.count),
    }

    const averageObj = {
        title: "Average",
        main: stats.numReadings === 0 ? formatWithMM(0) : formatWithMM(stats.total / stats.numReadings),
        subtitle: "per 15 mins"
    }

    return [totalObj, maxObj, minObj, averageObj];
}

function formatWithMM(num : number){
    return `${Math.round(num * 100) / 100} mm`;
}

function createMinMaxSubtitle(num : number){
    return `Occurred ${num.toLocaleString()} times`
}