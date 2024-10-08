/*
    Support for filtering rain gauge data to a specified timerange
    and sorting in chronological order for a timeseries graph.

    Outputs:
        subtotals                   Rain gauge data filtered to the date range and sorted into time order
        minDate                     Earliest timestamp in the unfiltered data (for setting "min" on input fields)
        maxDate                     Latest timestamp in the unfiltered data (for setting "max" on input fields)
        updateDateRange             Function to change the data range
*/

import { useState } from "react";
import { T_FetchedData, T_SelectedDateRange, T_RainGaugeSubtotal } from "./useRainGaugeData";
import { sortSubtotalsInDateOrder } from "./sortRainGaugeData";


export type T_TimeRangeOfData = {
    start : string,
    end : string,
}

export type T_UpdateDateRange = (dateRangeObj : T_SelectedDateRange | null) => void;

export type T_AdjustableDateRangeOutput = {
    subtotals : T_RainGaugeSubtotal[],
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
            if(needNewData(newDateRange)){
                fetchedData.updateDataForNewTimeRange({
                    start: newDateRange.start,
                    end: newDateRange.end
                });
            }

            setDateRange({
                start: newDateRange.start,
                end: newDateRange.end
            });
        }
    }


    // Check if this date range adjustment requires fresh data.
    function needNewData(newDateRange : T_SelectedDateRange){
        return exceedsExistingDateRange() || subtotalSizeHasChanged();

        function exceedsExistingDateRange(){
            // "null" defaults to "all available data" and so it can't be exceeded 
            // (well, it /could/ but it wouldn't make any difference to the data)
            if(dateRange === null){
                return false;
            }

            const startOutOfRange = 
                dateRange.start !== null 
                && (newDateRange.start === null || newDateRange.start < dateRange.start)
            ;

            const endOutOfRange = 
                dateRange.end !== null 
                && (newDateRange.end === null || newDateRange.end > dateRange.end)
            ;
            
            return startOutOfRange || endOutOfRange;
        }


        function subtotalSizeHasChanged(){
            const startDatetime = newDateRange.start === null
                ? fetchedData.data.minDate
                : newDateRange.start;
            
            const endDatetime = newDateRange.end === null
                ? fetchedData.data.maxDate
                : newDateRange.end;

            const diffInMs = Math.abs(endDatetime - startDatetime);
            const diffInHours = diffInMs / 1000 / 60 / 60;
            const newSubtotalSizeInHours = calcSubtotalSize(diffInHours);

            /* 
                Next we need to know the size-in-hours of the current subtotals. 
                The number of records is stored in each subtotal and the backend told us how many readings
                there are per hour, so we can work it out from those.
                But there's a (very minor) gotcha to consider first: it's possible for the first and last 
                subtotals to be incomplete, if the available data overlapped the subtotal time ranges.
                Therefore, if it exists, we will get the number of readings from subtotals[1], which is 
                always full.
            */
            const index = fetchedData.data.subtotals.length > 1
                ? 1
                : 0;
            const currentSubtotalSizeInHours = fetchedData.data.subtotals[index].numReadings / fetchedData.data.recordsPerHour;

            return newSubtotalSizeInHours !== currentSubtotalSizeInHours;
        }

        
        function calcSubtotalSize(numHoursToCover : number){
            const sizesInHours = fetchedData.data.subtotalSizesInHours;
            for(let i = 0; i < sizesInHours.length; i++){
                const thisSize = sizesInHours[i];
                const numSubtotals = numHoursToCover / thisSize;
                if(numSubtotals <= fetchedData.data.maxRecordsPerRequest){
                    return thisSize;
                }
            }
            return sizesInHours[sizesInHours.length - 1];
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
        const filtered = filterSubtotalsToDateRange();
        return sortSubtotalsInDateOrder(filtered);
    }

    function filterSubtotalsToDateRange(){
        const subtotals = fetchedData.data.subtotals;

        const filtered = subtotals.filter((record : T_RainGaugeSubtotal) => {
            const timestampAsDate = new Date(record.lastTimestamp);

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

        return filtered;

    }

    return {
        subtotals: filterAndSortData([]),
        minDate: fetchedData.data === undefined ? "" : fetchedData.data.minDate,
        maxDate: fetchedData.data === undefined ? "" : fetchedData.data.maxDate,
        updateDateRange,
    }
}


