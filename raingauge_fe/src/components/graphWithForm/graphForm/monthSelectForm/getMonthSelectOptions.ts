import { formatTwoDigits } from "@/util/dateStringHelpers";
import { T_SelectMonthOption } from "./types";

import { T_TimeRangeOfData } from "@/util/useAdjustableDateRange";

// Support for the "select one month" select: creates a list of months, with 
// human-readable names, computer-readable values, and how this translates to timestamps
export function getMonthOptionData(startAndEnd : T_TimeRangeOfData) : T_SelectMonthOption[] {

    if(startAndEnd.start === "" || startAndEnd.end === ""){
        return [];
    }
    const startDate = new Date(startAndEnd.start);
    const endDate = new Date(startAndEnd.end);

    let monthOptionData = [];
    for(let year = startDate.getFullYear(); year < endDate.getFullYear() + 1; year++){

        // Dynamic start and end numbers for the month loop to handle incomplete years at the start and end of the data
        const startMonth = year === startDate.getFullYear()
            ? startDate.getMonth()
            : 0;
        const endMonth = year === endDate.getFullYear()
            ? endDate.getMonth()
            : 12;

        for(let month = startMonth; month < endMonth; month++){
            const newMonthData = formatAsMonthOptionData(month, year);
            monthOptionData.push(newMonthData);
        }
    }

    return monthOptionData;
}

function formatAsMonthOptionData(month : number, year : number){
    /*
        Each timestamp reflects when the reading was taken and therefore represents the rain that fell in the 
        preceeding 15 minute period. This means all __:00 readings should be considered the last reading 
        of the previous hour (and, by extention, the last of the week, day, month, year, etc.).

        > startTimestamp uses a time of "00:01" to avoid the 00:00 last-reading that belongs to the previous month
        > endTimestamp is set to the first day of the next month and uses "00:00" so as to capture its last-reading
    */

    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayNextMonth = new Date(year, month + 1, 1);
    
    const newMonthData = {
        display: `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${firstDayOfMonth.getFullYear()}`,
        value: `${firstDayOfMonth.getFullYear()}-${formatTwoDigits(firstDayOfMonth.getMonth() + 1)}`,
        startTimestamp: `${firstDayOfMonth.getFullYear()}-${formatTwoDigits(firstDayOfMonth.getMonth() + 1)}-01T00:01`,
        endTimestamp: `${firstDayNextMonth.getFullYear()}-${formatTwoDigits(firstDayNextMonth.getMonth() + 1)}-01T00:00`
    }

    return newMonthData;
}
