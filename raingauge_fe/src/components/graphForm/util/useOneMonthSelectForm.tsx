"use client"

/*
    Controlled graph fields and error handling for the "select one month" section of the form
*/

import { useState } from "react";
import { convertStringToDate } from "@/util/dateStringHelpers";
import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";

export type T_SelectMonthOption = {
    display : string,
    value : string,
    startTimestamp : string,
    endTimestamp : string,
}

export type T_UseOneMonthSelectFormOutput = 
    Pick<T_AdjustableDateRangeOutput, 
        "monthOptionData" 
    > & {
        monthSelect : string,
        updateMonthSelect : (monthValue : string) => void,
        error : string
    };

type T_UseOneMonthSelectForm = 
    Pick<T_AdjustableDateRangeOutput, 
        "monthOptionData" 
        | "updateDateRange"
    >;

export function useOneMonthSelectForm({ updateDateRange, monthOptionData } : T_UseOneMonthSelectForm){

    const [monthSelect, setSelectMonth] = useState<string>("");
    const [monthSelectError, setMonthSelectError] = useState<string | null>(null);

    function updateMonthSelect(monthValue : string){
        const chosenMonth = monthOptionData.find(data => monthValue === data.value );
        if(chosenMonth === undefined){
            setMonthSelectError("Invalid month selected");
        }
        else{
            setSelectMonth(monthValue);
            const dateRange = {
                start: convertStringToDate(chosenMonth.startTimestamp),
                end: convertStringToDate(chosenMonth.endTimestamp),
            }
            updateDateRange(dateRange);
        }
    }

    return {
        monthSelect,
        updateMonthSelect,
        monthOptionData,
        error: monthSelectError,
    }
}