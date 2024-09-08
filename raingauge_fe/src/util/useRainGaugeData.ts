/*
    Fetches rain gauge data from the server and stores some hard-coded rain gauge details
*/

import useSWR from "swr";
import { useState } from "react";
import { formatDateForURL, } from "./dateStringHelpers";

export type T_FetchedData = {
    data : any,
    error : boolean,
    isLoading : boolean, 
    lat : number, 
    long : number, 
    updateDataForNewTimeRange : (dateRangeObj : T_SelectedDateRange) => void,
}

export type T_SelectedDateRange = {
    start : Date | null,
    end : Date | null,
}

export type T_RainGaugeSubtotal = {
    firstTimestamp : string,
    lastTimestamp : string,
    total : string,
    numReadings : string,
    max : T_RainGaugeSubtotalMinMax,
    min : T_RainGaugeSubtotalMinMax,
    minHour? : T_RainGaugeSubtotalMinMax,
    maxHour? : T_RainGaugeSubtotalMinMax,
}

export type T_RainGaugeSubtotalMinMax = {
    count : string,
    timestamp : string,
    reading: string,
}

export function useRainGaugeData(){
    const apiURL = "http://127.0.0.1:8000/api/";
    const [queryStr, setQueryStr] = useState<string>("");

    // Hard-coded lat and long: if the project expanded to multiple rain gauges, this info would probably
    // come from the server, so this seems a good place to keep it in the meantime :)
    const lat = 52.48049047465328;
    const long = -1.8978672581749725;
    const locationName = "Birmingham, United Kingdom";

    // While this might just have been the name of /the column/, I choose to believe it's the rain gauge's
    // name: it's pronounced "Redge-ay".
    const gaugeName = "RG_A";


    //@ts-expect-error (This line is straight from the SWR docs: I'm not interested in resolving TS's complaints about "implicit any")
    const fetcher = (...args) => fetch(...args).then(res => res.json());
    const {
        data,
        error,
        isLoading
    } = useSWR(`${apiURL}${ queryStr === "" ? "" : `?${queryStr}` }`, fetcher);


    function updateDataForNewTimeRange({ start, end } : T_SelectedDateRange){
        const startStr = start !== null
            ? `start=${formatDateForURL(start)}`
            : "";

        const endStr = end !== null
            ? `end=${formatDateForURL(end)}`
            : "";
            
        const delim = startStr !== "" && endStr !== ""
            ? "&"
            : "";

        const newUrlQueryStr = `${startStr}${delim}${endStr}`;
        setQueryStr(newUrlQueryStr);
    }


    return {
        data,
        error,
        isLoading,
        lat,
        long,
        locationName,
        gaugeName,
        updateDataForNewTimeRange,
    }
}