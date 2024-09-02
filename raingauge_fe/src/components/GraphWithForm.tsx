import { Graph } from "./graph/Graph";
import { GraphForm } from "./graphForm/GraphForm";

export function GraphWithForm({ title, xCoords, yCoords, formKit } : any){
    return <div className="row mt-3">
            <div className="col-12 col-md-5 col-lg-4 col-xl-3 order-2 order-md-1">
                <GraphForm
                    controlledEnd = { formKit.customDateRange.customEnd }
                    updateEnd = { formKit.customDateRange.updateEnd }
                    controlledStart = { formKit.customDateRange.customStart }
                    updateStart = { formKit.customDateRange.updateStart } 
                    updateGraphData = { formKit.customDateRange.updateGraphData }
                    min = { formKit.customDateRange.minDate }
                    max = { formKit.customDateRange.maxDate }
                    errors = { formKit.customDateRange.errors }  

                    controlledMonthSelect = { formKit.oneMonthSelect.monthSelect }
                    updateMonthSelect = { formKit.oneMonthSelect.updateMonthSelect }
                    monthOptionData = { formKit.oneMonthSelect.monthOptionData }
                    
                    resetGraphData = { formKit.reset }
                />
            </div>
            <div className="col-12 col-md-7 col-lg-8 col-xl-9 order-1 order-md-2 mb-4 mb-md-0">
                <Graph
                    title = { title }
                    xCoords={ xCoords }
                    yCoords={ yCoords }
                />
            </div>
    </div>

}