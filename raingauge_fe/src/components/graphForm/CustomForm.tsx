import { T_FormErrors } from "./util/useInteractiveData";

export type T_CustomFormProps = {
    controlledEnd : string,
    controlledStart : string,
    updateEnd : (dateStr : string) => void,
    updateGraphData : () => void,
    updateStart : (dateStr : string) => void,
    errors : T_FormErrors,
    min : string,
    max : string,
}

export function CustomForm({ controlledEnd, controlledStart, updateEnd, updateGraphData, updateStart, errors, min, max } : T_CustomFormProps){
    const idStart = "id_formInput_start";
    const idEnd = "id_formInput_end";

    return (
        <>
            <div>
                <label htmlFor={idStart} className="form-label">Start</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={idStart} 
                    value={controlledStart} 
                    onChange={ (e) => updateStart(e.target.value) }
                    min={min}
                    max={max}
                />
                <p>
                { errors.start !== "" ?
                    errors.start
                    : null
                }
                </p>
            </div>
                
            <div className="mt-3">
                <label htmlFor={idEnd} className="form-label">End</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={idEnd} 
                    value={controlledEnd} 
                    onChange={ (e) => updateEnd(e.target.value) }
                    min={min}
                    max={max}
                />
                <p>
                { errors.end !== "" ?
                    errors.end
                    : null
                }
                </p>
            </div>

            <div className={"mt-5"}>
                <p>
                { errors.update !== "" ?
                    errors.update
                    : null
                }
                </p>
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