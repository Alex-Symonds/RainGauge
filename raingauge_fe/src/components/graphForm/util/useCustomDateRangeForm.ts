"use client"

/*
    Controlled form fields for the custom date range section
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
        customStart,
        updateStart,

        customEnd,
        updateEnd,
        
        updateGraphData,
        onReset,
        
        errors: {
            update: updateError,
        },

        minDate: defaultStart,
        maxDate: defaultEnd,
    }
}