import { Graph } from "./Graph";
import { GraphForm } from "./GraphForm";

export function GraphWithForm({ title, xCoords, yCoords, formKit } : any){
    return <div className="row mt-3">
            <div className="col-12 col-md-5 col-lg-4 col-xl-3 order-2 order-md-1">
                <GraphForm
                    controlledEnd = { formKit.end }
                    controlledStart = { formKit.start }
                    min = { formKit.minDate }
                    max = { formKit.maxDate }
                    
                    updateEnd = { formKit.updateEnd }
                    updateGraphData = { formKit.updateGraphData }
                    updateStart = { formKit.updateStart }  
                    errors = { formKit.errors }                  
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