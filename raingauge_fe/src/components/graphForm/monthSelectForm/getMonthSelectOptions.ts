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
    const firstDayOfMonth = new Date(year, month, 1);
    // To save relearning this if it doesn't come up again for a while:
    // [Date] considers "0th of $MONTH" to be "the day before the 1st of $MONTH" aka "last day of ($MONTH - 1)",
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const newMonthData = {
        display: `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${firstDayOfMonth.getFullYear()}`,
        value: `${firstDayOfMonth.getFullYear()}-${formatTwoDigits(firstDayOfMonth.getMonth()+1)}`,
        startTimestamp: `${firstDayOfMonth.getFullYear()}-${formatTwoDigits(firstDayOfMonth.getMonth() + 1)}-01T00:00`,
        endTimestamp: `${lastDayOfMonth.getFullYear()}-${formatTwoDigits(lastDayOfMonth.getMonth() + 1)}-${lastDayOfMonth.getDate()}T23:59`
    }
    return newMonthData;
}
