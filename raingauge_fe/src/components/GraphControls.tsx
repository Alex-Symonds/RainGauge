
type T_GraphControlsProps = {
    controlledEnd : string,
    controlledStart : string,
    updateEnd : (dateStr : string) => void,
    updateGraphData : () => void,
    updateStart : (dateStr : string) => void,
}


export function GraphControls({
    controlledEnd, controlledStart, updateEnd, updateGraphData, updateStart,
} : T_GraphControlsProps){

    const idStart = "id_formInput_start";
    const idEnd = "id_formInput_end";

    return (
        <form>
            <div className="mb-3">
                <label htmlFor={idStart} className="form-label">Start</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={idStart} 
                    value={controlledStart} 
                    onChange={ (e) => updateStart(e.target.value) }
                />
            </div>
            <div className="mb-3">
                <label htmlFor={idEnd} className="form-label">End</label>
                <input 
                    type="datetime-local" 
                    className="form-control" 
                    id={idEnd} 
                    value={controlledEnd} 
                    onChange={ (e) => updateEnd(e.target.value) }
                />
            </div>
            <div className={"mt-4"}>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick = { updateGraphData }
                >
                    Update Graph
                </button>
            </div>
        </form>
    )
}