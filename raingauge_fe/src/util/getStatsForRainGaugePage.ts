/*
    Performs calculations and formats the data for use in the "stats cards"
*/

import { formatDate } from "@/util/dateStringHelpers";
import { T_RainGaugeSubtotal, T_RainGaugeSubtotalMinMax } from "@/util/useRainGaugeData";
import { T_StatsCardProps } from "../components/statsCards/StatsCard";
import { calcWettestDriestGroupStats, T_CalcWettestDriestGroupStatsOutput, T_WettestDriestResult } from "./calcWettestAndDriest";

export type T_StatsDataOutput = {
    statsCards: T_StatsCardProps[],
    wettestDriestTable: T_WettestDriestResult[],
};

type T_StatsAccumulator = {
    total : number,
    numReadings : number,
}



export function getStatsForRainGaugePage(filteredData : T_RainGaugeSubtotal[], numReadingsPerHour : number) : T_StatsDataOutput{
    const minAndMaxes : T_CalcWettestDriestGroupStatsOutput = calcWettestDriestGroupStats(filteredData, numReadingsPerHour);
    
    let tableData : T_WettestDriestResult[] = [];
    if('hour' in minAndMaxes && 'day' in minAndMaxes && 'month' in minAndMaxes){
        tableData = [minAndMaxes.hour, minAndMaxes.day, minAndMaxes.month]
    }

    const stats = calculateReadingsTotalAndCount(filteredData);
    const readingMinMax = 'reading' in minAndMaxes ? minAndMaxes.reading : getDummyWDR();
    const cardsData = formatStats(stats, numReadingsPerHour, readingMinMax);

    return {
        statsCards: cardsData,
        wettestDriestTable: tableData,
    }
}


function calculateReadingsTotalAndCount(filteredData : T_RainGaugeSubtotal[]){
    const FALLBACK = { 
        total: 0, 
        numReadings: 0 
    };

    return filteredData.length === 0
        ? FALLBACK
        : filteredData.reduce(
            (acc : T_StatsAccumulator, curr : T_RainGaugeSubtotal) => {
                return {
                    total: acc.total + parseFloat(curr.total),
                    numReadings: acc.numReadings + parseFloat(curr.numReadings),
                }
            }, 
            { 
                total: 0, 
                numReadings: 0, 
            }
        );
}


function formatStats(stats : T_StatsAccumulator, numReadingsPerHour : number, readingsWDR : T_WettestDriestResult){
    const READINGS_PER_DAY = numReadingsPerHour * 24;
    const numDays = READINGS_PER_DAY === 0 
        ? 0
        : Math.round(stats.numReadings/READINGS_PER_DAY);

    const totalObj = {
        title: "Total",
        main: formatWithMM(stats.total),
        subtitle: `${stats.numReadings.toLocaleString()} readings over ${ numDays } day${ numDays === 1 ? "" : "s"}`
    }

    const maxObj = {
        title: "High",
        main: ('replaceTotal' in readingsWDR.wettest && readingsWDR.wettest.replaceTotal !== undefined) ? readingsWDR.wettest.replaceTotal : formatWithMM(readingsWDR.wettest.total),
        subtitle: readingsWDR.wettest.description,
    }

    const minObj = {
        title: "Low",
        main: ('replaceTotal' in readingsWDR.driest && readingsWDR.driest.replaceTotal !== undefined)  ? readingsWDR.driest.replaceTotal : formatWithMM(readingsWDR.driest.total),
        subtitle: readingsWDR.driest.description
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

function getDummyWDR(){
    return {
        heading: "",
        wettest : {
            count: 0,
            total: 0,
            description: "-",
        },
        driest : {
            count: 0,
            total: 0,
            description: "-",
        },
    }
}