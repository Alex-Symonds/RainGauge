/*
    Support for filtering rain gauge data to a specified timerange
    and sorting in chronological order for a timeseries graph.

    Outputs:
        data                        Rain gauge data filtered to the date range and sorted into time order
        minDate                     Earliest timestamp in the unfiltered data (for setting "min" on input fields)
        maxDate                     Latest timestamp in the unfiltered data (for setting "max" on input fields)
        updateDateRange             Function to change the data range
*/

import { useState } from "react";
import { T_FetchedData, T_RainGaugeReading } from "./useRainGaugeData";
import { sortInDateOrder } from "./sortRainGaugeData";


type T_SelectedDateRange = {
    start : Date | null,
    end : Date | null,
}

export type T_TimeRangeOfData = {
    start : string,
    end : string,
}

export type T_UpdateDateRange = (dateRangeObj : T_SelectedDateRange | null) => void;

export type T_AdjustableDateRangeOutput = {
    data : T_RainGaugeReading[],
    minDate : string,
    maxDate : string,
    updateDateRange : T_UpdateDateRange,
}

export function useAdjustableDateRange(fetchedData : T_FetchedData) : T_AdjustableDateRangeOutput{
    const [dateRange, setDateRange] = useState<null | T_SelectedDateRange>(null);

    // Updating the date range
    function updateDateRange(newDateRange : T_SelectedDateRange | null){
        if(newDateRange === null){
            setDateRange(null);
        }
        else if(isValidDateRange(newDateRange)){
            setDateRange({
                start: newDateRange.start,
                end: newDateRange.end
            })
        }
    }

    function isValidDateRange(variable : any){
        
        function isValidDateOrNull(variable : any){
            return variable === null
                || Object.prototype.toString.call(variable) === "[object Date]";
        }

        return variable !== null
            && typeof variable === 'object' 
            && 'start' in variable
            && 'end' in variable
            && isValidDateOrNull(variable.start)
            && isValidDateOrNull(variable.end)
        ;
    }


    // Using the date range
    function filterAndSortData(fallback? : any){
        if(fetchedData.error || fetchedData.isLoading){
            return fallback ?? [];
        }
        const filtered = filterDataToDateRange();
        return sortInDateOrder(filtered);
    }

    function filterDataToDateRange(){
        if(dateRange === null){
            return fetchedData.data.data;
        }
        return fetchedData.data.data.filter((record : T_RainGaugeReading) => {
            const timestampAsDate = new Date(record.timestamp);

            const afterStart = 
                dateRange === null 
                || dateRange.start === null
                || timestampAsDate >= dateRange.start;

            const beforeEnd = 
                dateRange === null 
                || dateRange.end === null
                || timestampAsDate <= dateRange.end;

            return afterStart && beforeEnd
        });
    }

    // // Get the first and last timestamp in the data
    const startAndEnd = function getStartAndEndOfAvailableData(){
        if(fetchedData.isLoading || fetchedData.error || fetchedData.data.data.length === 0){
            return { start: "", end: "" };
        }
        
        const sorted = sortInDateOrder(fetchedData.data.data)
        return {
                start: sorted[0].timestamp,
                end: sorted[fetchedData.data.data.length - 1].timestamp
            }
    }();

    return {
        data: filterAndSortData([]),
        minDate: startAndEnd.start,
        maxDate: startAndEnd.end,
        updateDateRange,
    }
}


