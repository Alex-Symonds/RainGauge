"use client"

/*
    Controlled graph fields and error handling for user inputs
*/

import { useState } from "react";
import { convertStringToDate } from "@/util/dateStringHelpers";

export type T_SelectMonthOption = {
    display : string,
    value : string,
    startTimestamp : string,
    endTimestamp : string,
}

type T_UseOneMonthSelectForm = {
    updateDateRange : any, 
    monthOptionData : T_SelectMonthOption[]
}

export function useOneMonthSelectForm({ updateDateRange, monthOptionData } : T_UseOneMonthSelectForm){

    const [selectMonth, setSelectMonth] = useState<string>("");
    const [monthSelectError, setMonthSelectError] = useState<string | null>(null);

    function updateMonthSelect(monthValue : string){
        const chosenMonth = monthOptionData.find(data => monthValue === data.value );
        if(chosenMonth === undefined){
            setMonthSelectError("Invalid month selected");
        }
        else{
            console.log("update setting to", monthValue);
            setSelectMonth(monthValue);
            const dateRange = {
                start: convertStringToDate(chosenMonth.startTimestamp),
                end: convertStringToDate(chosenMonth.endTimestamp),
            }
            updateDateRange(dateRange);
        }
    }

    return {
        selectMonth,
        updateMonthSelect,
        monthOptionData,
        error: monthSelectError,
    }
}