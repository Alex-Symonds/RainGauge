/*
    Runs functions to generate stats based on the rain gauge data, then packages it up
    for the components
*/

import { T_RainGaugeSubtotal } from "@/util/useRainGaugeData";
import { T_StatsCardProps } from "../../components/statsCards/StatsCard";
import { T_WettestDriestResult } from "./createMinMaxFinder";
import { getMinMaxDays, getMinMaxHours, getMinMaxMonths, getMinMaxReadings } from "./configMinMaxFinder";

export type T_StatsDataOutput = {
    statsCards: T_StatsCardProps[],
    wettestDriestTable: T_WettestDriestResult[],
};

type T_StatsAccumulator = {
    total : number,
    numReadings : number,
}

export function getStatsForRainGaugePage(filteredData : T_RainGaugeSubtotal[], numReadingsPerHour : number) : T_StatsDataOutput{
    const tableData = [
        getMinMaxHours(filteredData, numReadingsPerHour),
        getMinMaxDays(filteredData, numReadingsPerHour),
        getMinMaxMonths(filteredData, numReadingsPerHour),
    ]

    const stats = calculateReadingsTotalAndCount(filteredData);
    const readingMinMax = getMinMaxReadings(filteredData, numReadingsPerHour);
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