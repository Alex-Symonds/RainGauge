"use client"

/*
    Controlled form fields for the custom date range section
*/

import { useEffect, useState } from "react";
import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";
import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";



type T_UseCustomDateRangeProps = 
    Pick<T_AdjustableDateRangeOutput, 
        "updateDateRange"
        | "minDate"
        | "maxDate"
    >;

export type T_UseCustomDateRangeOutput = {
    controlledEnd : string,
    controlledStart : string,
    errors: {
        update : string | null,
    },
    minDate : string,
    maxDate : string,
    onReset : () => void,
    updateEnd : (datetimeStr : string) => void,
    updateStart : (datetimeStr : string) => void,
    updateGraphData : () => void,
}

export function useCustomDateRangeForm({ updateDateRange, minDate : defaultStart, maxDate : defaultEnd } : T_UseCustomDateRangeProps){
    
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if(customStart===""){
            setCustomStart(defaultStart);
        }
        if(customEnd === ""){
            setCustomEnd(defaultEnd);
        }
    }, [defaultStart, defaultEnd]);


    function updateStart(datetimeStr : string){
        setUpdateError(null);

        if(strIsValidForDateCreation(datetimeStr)){
            setCustomStart(datetimeStr);
        }
    }

    function updateEnd(datetimeStr : string){
        setUpdateError(null);

        if(strIsValidForDateCreation(datetimeStr)){
            setCustomEnd(datetimeStr);
        }
    }

    function updateGraphData(){
        if(!strIsValidForDateCreation(customStart) && !strIsValidForDateCreation(customEnd)){
            setUpdateError("The dates are garbled. Try reloading the page.");
            return;
        }

        const startDateNum = new Date(customStart).valueOf();
        const endDateNum = new Date(customEnd).valueOf();
        if(endDateNum >= startDateNum){
            const dateRange = {
                start: convertStringToDate(customStart),
                end: convertStringToDate(customEnd),
            }
            updateDateRange(dateRange); 
        }
        else {
            setUpdateError("Start date must come before end date.")
        }
    }

    function onReset(){
        setCustomStart(defaultStart);
        setCustomEnd(defaultEnd);
    }

    return {
        controlledEnd: customEnd,
        controlledStart: customStart,
        errors: {
            update: updateError,
        },
        maxDate: defaultEnd,
        minDate: defaultStart,
        onReset,
        updateEnd,
        updateGraphData,
        updateStart,
    }
}