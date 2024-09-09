/*
    UI component making the section containing a form with the graph next to it
*/

import { Graph } from "./graph/Graph";
import { GraphForm } from "./graphForm/GraphForm";
import { T_UseInteractiveDataOutput } from "./graphForm/util/useInteractiveData";
import { Loading } from "./loading/Loading";

type T_GraphWithFormProps = {
    title : string,
    xCoords : string[],
    yCoords : number[],
    formKit : T_UseInteractiveDataOutput
}

export function GraphWithForm({ title, xCoords, yCoords, formKit } : T_GraphWithFormProps){
    return (
        <div className="row mt-3">
            <div className="col-12 col-md-5 col-lg-4 col-xl-3 order-2 order-md-1">
                <GraphForm
                    customFormKit = { formKit.customDateRange }
                    dateAndDurationKit = { formKit.dateAndDuration }
                    oneMonthFormKit = { formKit.oneMonthSelect }
                    resetGraphData = { formKit.reset }
                />
            </div>
            <div className="col-12 col-md-7 col-lg-8 col-xl-9 order-1 order-md-2 mb-4 mb-md-0 position-relative">
                <Loading />
                <Graph
                    title = { title }
                    xCoords ={ xCoords }
                    yCoords ={ yCoords }
                />
            </div>
    </div>
    )
}