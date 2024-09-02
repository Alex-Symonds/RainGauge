/*
    Fetches rain gauge data from the server and stores hard-coded long and lat
    for the apparatus' location
*/

import useSWR from "swr";

export type T_RainGaugeReading = {
    timestamp : string,
    reading: string,
}

export type T_FetchedData = {
    data : any,
    error : boolean,
    isLoading : boolean, 
    lat : number, 
    long : number, 
}

export function useRainGaugeData(){
    const apiURL = "http://127.0.0.1:8000/api/";

    // Hard-coded lat and long: if the project expanded to multiple rain gauges, this info would probably
    // come from the server, so this seems a good place to keep it in the meantime :)
    const lat = 52.48049047465328;
    const long = -1.8978672581749725;
    const locationName = "Birmingham, United Kingdom";

    // While this might just have been the name of /the column/, I choose to believe it's the rain gauge's
    // name: it's pronounced "Reggie"
    const gaugeName = "RG_A";


    //@ts-expect-error (This line is straight from the SWR docs: I'm not interested in resolving TS's complaints about "implicit any")
    const fetcher = (...args) => fetch(...args).then(res => res.json());
    const {
        data,
        error,
        isLoading
    } = useSWR(apiURL, fetcher);

    return {
        data,
        error,
        isLoading,
        lat,
        long,
        locationName,
        gaugeName,
    }
}