/*
    Support for filtering rain gauge data to a specified timerange
    and sorting in chronological order for a timeseries graph.

    Outputs:
        data                        Filtered to the date range and sorted into time order
        filterDataToDateRange       In case you only want the filtering without the sorting
        getTimeRangeGraphTitle      Generates a title for the graph
        minDate                     Earliest timestamp in the unfiltered data (for setting "min" on input fields)
        maxDate                     Latest timestamp in the unfiltered data (for setting "max" on input fields)
        updateDateRange             Function to change the data range
*/

import { useState } from "react";
import { T_RainGaugeReading } from "./useRainGaugeData";
import { formatDate } from "./dateStringHelpers";

export type T_DateRange = {
    start : Date | null,
    end : Date | null,
}

export function useDynamicTimeSeries(fetchedData : any){
    const [dateRange, setDateRange] = useState<null | T_DateRange>(null);

    // Updating the date range
    function updateDateRange(newDateRange : T_DateRange | null){
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

    function sortInDateOrder(data : T_RainGaugeReading[]){
        return data.toSorted((a : T_RainGaugeReading, b : T_RainGaugeReading) => {
            const aDate = new Date(a.timestamp).valueOf();
            const bDate = new Date(b.timestamp).valueOf();
            return aDate - bDate;
        })
    }

    // Generate a title for the graph, showing the timestamps of the first and last data point in the selected time range
    // (e.g. Suppose the user picked an end time of "23:59". Readings are at 15 min intervals, so the last data points 
    // would be at 23:45, therefore "23:45" is displayed)
    function getTimeRangeGraphTitle(){
        const selectedData = filterAndSortData([{ reading: '0', timestamp: "01/01/1900T00:00" }]);
        const startStr = formatDate(selectedData[0].timestamp);
        const endStr = formatDate(selectedData[selectedData.length - 1].timestamp);
        return `Data from ${startStr} to ${endStr}`;
    }

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
        filterDataToDateRange,
        getTimeRangeGraphTitle,
        minDate: startAndEnd.start,
        maxDate: startAndEnd.end,
        updateDateRange,
    }
}


