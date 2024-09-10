/*
    Functions to set configuration options and return the outcome of createHydroMinMaxFinder
*/

import { T_RainGaugeSubtotal } from "../useRainGaugeData";
import { createHydroMinMaxFinder } from "./createMinMaxFinder";
import { formatDateWithShortMonthAndTime, formatTwoDigits } from "../dateStringHelpers";


export function getMinMaxReadings(subtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){
    return createHydroMinMaxFinder({
        convertHoursToUnits: (duration : number) => duration * numReadingsPerHour,
        descFn: formatDateWithShortMonthAndTime,
        heading: "Reading",
        keys: { minKey: 'min', maxKey: 'max' },
        minReadingsPerUnit: 1,
        subtotals,
        unitsForDescription: "reading",
    })
}

export function getMinMaxHours(subtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){
    return createHydroMinMaxFinder({
        convertHoursToUnits: (duration : number) => duration,
        descFn: getHourString,
        heading: "Hour",
        keys: { minKey: 'minHour', maxKey: 'maxHour' },
        minReadingsPerUnit: numReadingsPerHour,
        subtotals,
        unitsForDescription: "hour",
    })
}

export function getMinMaxDays(subtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){
    return createHydroMinMaxFinder({
        convertHoursToUnits: (duration : number) => duration / 24,
        descFn: getDayString,
        heading: "Day", 
        minReadingsPerUnit: numReadingsPerHour * 24,
        subtotals,
        unitsForDescription: "day",
    })
}


export function getMinMaxMonths(subtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){
    // Minimum month duration is a bit awkward due to the varying durations.
    // The minimum duration is only used to disqualify "incomplete" months, so my thinking is:
    // if 28 days is good enough to count as a complete month for February, it's good 
    // enough to count as a complete month for the rest of the year too
    const COMPLETE_MONTH_IN_DAYS = 28;
    return createHydroMinMaxFinder({
        convertHoursToUnits: (duration : number) => duration / 24 / COMPLETE_MONTH_IN_DAYS,
        descFn: getMonthString,
        heading: "Month",
        minReadingsPerUnit: numReadingsPerHour * 24 * COMPLETE_MONTH_IN_DAYS,
        subtotals,
        unitsForDescription: "month",
    })
}


/* 
    || Group string generators
    These are doing double duty.
    1) They're displayed on the page (when there's only one "winning" time unit)
    2) Since, by definition, they can be derived from timestamps and there's a different one for each time unit group,
       I'm also using them as the group identifier for "working" updates. If the current timestamp would generate a
       different description, that implies it's part of a different group, so the previous group is finished.
*/
function getHourString(endDate : Date){
    /*
        Note/example: readings at 06:15, 06:30, 06:45 and 07:00 should be grouped together to 
        form an hour, since the 07:00 reading covers rain that fell in the preceeding 15 mins. 
    */

    // Use Date object so the built in stuff can handle days, months and years flipping over
    let displayStart = new Date(endDate.getTime());
    let displayEnd = new Date(endDate.getTime());

    // Handle hours ticking over
    if(endDate.getMinutes() === 0){
        // This could be the "01 MONTH YEAR 00:00" reading, which
        // needs to be counted in the last hour of the last day of the previous month, which could also tick back the year
        displayStart.setMinutes(-1);
    } else {
        // It's a :15, :30 or :45 reading, so the end of the hour range needs to show the next hour
        displayEnd.setHours(endDate.getHours() + 1);
    }

    const dayStr = getDayString(displayStart);
    return `${formatTwoDigits(displayStart.getHours())}:15 - ${formatTwoDigits(displayEnd.getHours())}:00, ${dayStr}`;

}
    
function getDayString(date : Date){
    if(date.getMinutes() === 0 && date.getHours() === 0){
        // This could be the "01 MONTH YEAR 00:00" reading, which
        // needs to be counted in the last day of the previous month, which could also tick back the year
        date.setMinutes(-1);
    }
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
}


function getMonthString(date : Date){
    let dayToUse = new Date(date.getFullYear(), date.getMonth(), 1);
    if(date.getHours() === 0 && date.getMinutes() === 0){
        // This could be the "01 MONTH YEAR 00:00" reading, which
        // needs to be counted in the previous month, which could also tick back the year
        dayToUse.setMinutes(-1);
    }
    return `${dayToUse.toLocaleString('default', { month: 'long' })} ${ dayToUse.getFullYear() }`
}
