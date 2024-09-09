/*
    UI Component for the contents of the "custom date range" portion of the form
*/

import { useId } from "react";
import { T_FormErrors } from "../util/useInteractiveData";


export type T_CustomFormProps = {
    controlledEnd : string,
    controlledStart : string,
    errors : T_FormErrors,
    maxDate : string,
    minDate : string,
    updateEnd : (dateStr : string) => void,
    updateGraphData : () => void,
    updateStart : (dateStr : string) => void, 
}


export function CustomForm({ controlledEnd, controlledStart, errors, minDate, maxDate, updateEnd, updateGraphData, updateStart } : T_CustomFormProps){
    const formSectionID = useId();
    const idStart = formSectionID + "customStart";
    const idEnd = formSectionID + "customEnd";

    return (
        <>
            <div>
                <label htmlFor={idStart} className="form-label">Start</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={ idStart } 
                    value={ controlledStart } 
                    onChange={ (e) => updateStart(e.target.value) }
                    min = { minDate }
                    max = { maxDate }
                />
            </div>
                
            <div className="mt-3">
                <label htmlFor={idEnd} className="form-label">End</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={idEnd} 
                    value={controlledEnd} 
                    onChange={ (e) => updateEnd(e.target.value) }
                    min = { minDate }
                    max = { maxDate }
                />
            </div>

            <div className={"mt-5"}>
                <div role="region" aria-live="polite">
                { errors.update !== null && errors.update !== undefined && errors.update !== "" ?
                    <p className="alert alert-danger">{errors.update}</p>
                    : null
                }
                </div>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick = { updateGraphData }
                >
                    Update
                </button>
            </div>
        </>
    )
}