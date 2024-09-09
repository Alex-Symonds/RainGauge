import { useId } from "react";
import { T_FormErrors } from "../util/useInteractiveData";
import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";


export type T_DateAndDurationFormProps = 
    Pick<T_AdjustableDateRangeOutput, 
        "maxDate" 
        | "minDate"
    > & {
        controlledStartDate : string,
        controlledDuration : string,
        durationOptions : T_DurationOptions[],
        error: T_FormErrors,
        updateSelectedDuration : (optionValue : string) => void,
        updateStartDate : (dateStr : string) => void,
        warning: T_FormErrors,
}

export type T_DurationOptions = {
    display : string,
    value : string,
}

export function DateAndDurationForm({ 
    controlledStartDate, controlledDuration, durationOptions, error, maxDate, minDate, updateSelectedDuration, updateStartDate, warning, 
} : T_DateAndDurationFormProps){

    const formSectionID = useId();
    const idStart = formSectionID + "durationStart";
    const idDurationRadioLabel = formSectionID + "durationRadioLabel";
    const nameDurationRadio = formSectionID + "durationRadioName";
    const durationOptionPrefix = formSectionID + "durationOption-";

    return (
        <>
            <div>
                <label htmlFor={idStart} className="form-label">Start Date</label>
                <input 
                    type="date" 
                    className="form-control" 
                    id={idStart} 
                    value={ controlledStartDate } 
                    onChange={ (e) => updateStartDate(e.target.value) }
                    min={ minDate.slice(0, -9) }
                    max={ maxDate.slice(0, -9) }
                />
            </div>
            <div className="mt-4" role="radiogroup" aria-labelledby={idDurationRadioLabel} >
                <div id={idDurationRadioLabel} className="form-label">Duration</div>

                <div>
                { durationOptions !== null && durationOptions !== undefined ?
                    durationOptions.map(optionData => {
                        const id = durationOptionPrefix + optionData.value;
                        return (
                            <div key={ optionData.value }
                                className="form-check mt-2"
                            >
                                <input 
                                    type="radio" 
                                    className="form-check-input" 
                                    name={ nameDurationRadio } 
                                    id={id} 
                                    autoComplete="off" 
                                    value = { optionData.value }
                                    checked={ optionData.value === controlledDuration }
                                    onChange = { () => { updateSelectedDuration(optionData.value) } } 
                                />
                                <label className="form-check-label" htmlFor={id}>{ optionData.display }</label>
                            </div>
                        )})
                    : null
                }
                </div>

                <div role="region" aria-live="polite">
                { error.update !== null && error.update !== undefined && error.update !== "" ?
                    <p className="alert alert-danger mt-3">{error.update}</p>
                    : null
                }
                { warning.form !== null && warning.form !== undefined && warning.form !== "" ?
                    <p className="alert alert-warning mt-3">{warning.form}</p>
                    : null
                }
                </div>


            </div>
        </>
    )
}