"use client"

/*
    Controlled graph fields and error handling for the "select one month" section of the form
*/

import { useState } from "react";

import { convertStringToDate } from "@/util/dateStringHelpers";

import { getMonthOptionData } from "./getMonthSelectOptions";
import { T_UseOneMonthSelectFormProps } from "./types";

export function useOneMonthSelectForm({ maxDate, minDate, updateDateRange } : T_UseOneMonthSelectFormProps){

    const valueForDisabledDefault = "disabledDefault";

    const [monthSelect, setSelectMonth] = useState<string>(valueForDisabledDefault);
    const [monthSelectError, setMonthSelectError] = useState<string | null>(null);

    const monthOptionData = getMonthOptionData({ start: minDate, end: maxDate });

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

    function onReset(){
        setSelectMonth(valueForDisabledDefault);
    }

    return {
        controlledMonthSelect: monthSelect,
        error: monthSelectError,
        monthOptionData,
        onReset,
        updateMonthSelect,
    }
}