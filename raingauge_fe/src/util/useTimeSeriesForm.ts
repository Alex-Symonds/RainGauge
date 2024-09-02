"use client"

/*
    Controlled graph fields and error handling for user inputs
*/

import { useEffect, useState } from "react";
import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";

export type T_FormErrors = {
    start : string | null,
    end : string | null,
    update: string | null
}

type T_UseInteractiveGraphProps = {
    updateDateRange : any, 
    defaultStart : string, 
    defaultEnd : string
}

export function useTimeSeriesForm({ updateDateRange, defaultStart, defaultEnd } : T_UseInteractiveGraphProps){
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [startError, setStartError] = useState<string | null>(null);
    const [endError, setEndError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if(start===""){
            setStart(defaultStart);
        }
        if(end === ""){
            setEnd(defaultEnd);
        }
    }, [defaultStart, defaultEnd]);

    function updateStart(datetimeStr : string){
        if(strIsValidForDateCreation(datetimeStr)){
            setUpdateError(null);
            setStartError(null);
            setStart(datetimeStr);
        }
        else {
            setStartError("Invalid: not a date");
        }
    }

    function updateEnd(datetimeStr : string){
        if(strIsValidForDateCreation(datetimeStr)){
            setUpdateError(null);
            setEndError(null);
            setEnd(datetimeStr);
        }
        else {
            setStartError("Invalid: not a date");
        }
    }

    function updateGraphData(){
        const startDateNum = new Date(start).valueOf();
        const endDateNum = new Date(end).valueOf();

        if(endDateNum >= startDateNum){
            const dateRange = {
                start: convertStringToDate(start),
                end: convertStringToDate(end),
            }
            updateDateRange(dateRange); 
        }
        else {
            setUpdateError("Start date must come before end date.")
        }
    }

    return {
        start,
        end,
        updateStart,
        updateEnd,
        updateGraphData,
        errors: {
            start: startError,
            end: endError,
            update: updateError,
        }
    }
}