"use client"

/*
    Controlled graph fields and error handling for user inputs
*/

import { useEffect, useState } from "react";
import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";

type T_UseCustomDateRangeProps = {
    updateDateRange : any, 
    defaultStart : string, 
    defaultEnd : string,
}

export function useCustomDateRangeForm({ updateDateRange, defaultStart, defaultEnd } : T_UseCustomDateRangeProps){
    
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");

    const [startError, setStartError] = useState<string | null>(null);
    const [endError, setEndError] = useState<string | null>(null);
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
        if(strIsValidForDateCreation(datetimeStr)){
            setUpdateError(null);
            setStartError(null);
            setCustomStart(datetimeStr);
        }
        else {
            setStartError("Invalid: not a date");
        }
    }

    function updateEnd(datetimeStr : string){
        if(strIsValidForDateCreation(datetimeStr)){
            setUpdateError(null);
            setEndError(null);
            setCustomEnd(datetimeStr);
        }
        else {
            setStartError("Invalid: not a date");
        }
    }

    function updateGraphData(){
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
        customStart,
        updateStart,

        customEnd,
        updateEnd,
        
        updateGraphData,
        onReset,
        
        errors: {
            start: startError,
            end: endError,
            update: updateError,
        },

        minDate: defaultStart,
        maxDate: defaultEnd,
    }
}