"use client"
import { useState } from "react";
import { Graph } from "./Graph";
import { GraphControls } from "./GraphControls";


export function GraphControlsWrapper(){

    const data = useInteractiveGraph();

    return <div className="row mt-3">
            <div className="col">
                <GraphControls
                    controlledEnd = { data.end }
                    controlledStart = { data.start }
                    
                    updateEnd = { data.updateEnd }
                    updateGraphData = { data.updateGraphData }
                    updateStart = { data.updateStart }

                />
            </div>
            <div className="col">
                <Graph
                    title = { data.graphTitle }
                    xCoords={ data.xCoords }
                    yCoords={ data.yCoords }
                />
            </div>
    </div>

}


export function useInteractiveGraph(){
    const earliestDate = "2017-06-10T00:00";
    const now = new Date(Date.now()).toISOString().slice(0, -8);
    const [start, setStart] = useState<string>(earliestDate);
    const [end, setEnd] = useState<string>(now);

    const [fetchUrl, setFetchUrl] = useState<string>("");

    const [graphTitle, setGraphTitle] = useState<string>("Rainfall Graph")
    const [xCoords, setXCoords] = useState(['2017-08-08 15:00', '2017-08-08 15:15', '2017-08-08 15:30']);
    const [yCoords, setYCoords] = useState([2, 6, 3]);


    function updateStart(datetimeStr : string){
        const validStart = datetimeStr;
        // Check str is valid
        // Success = setStartDate(dateObj)
        // Failure = throw error
        setStart(validStart);
    }

    function updateEnd(datetimeStr : string){
        const validEnd = datetimeStr;
        // Check str is valid
        // Success = setEndDate(dateObj)
        // Failure = throw error
        setEnd(validEnd);
    }


    function datetimeStrIsValidForInput(datetimeStr : string){

    }

    function updateGraphData(){
        // Check start and end are a) not null; b) end is later than start
        // Check if data for that range is already cached
        //      Yes = grab from cache
        //      No = fetch from server
        // setXCoords, setYCoords, setGraphTitle
        console.log(`Update graph timerange to ${start} (${typeof start}) to ${end} (${typeof end})`);
    }


    return {
        graphTitle,
        xCoords,
        yCoords,
        start,
        end,
        updateStart,
        updateEnd,
        updateGraphData
    }
}