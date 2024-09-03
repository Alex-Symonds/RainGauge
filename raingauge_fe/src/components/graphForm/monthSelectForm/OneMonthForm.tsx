/*
    UI Component for the contents of the "one month" portion of the form
*/

import { T_SelectMonthOption, T_OneMonthFormProps } from "./types";



export function OneMonthForm({ controlledMonthSelect, monthOptionData, updateMonthSelect } : T_OneMonthFormProps){
    const idMonthSelect = "id_formInput_monthSelect";

    return (
        <>
                    <label htmlFor={idMonthSelect} className="form-label">Select Month</label>
                    <select className="form-select"
                        id = { idMonthSelect }
                        name = { "selectOneMonth" }
                        value = { controlledMonthSelect }
                        onChange = { (e) => updateMonthSelect(e.target.value) }
                    >
                        <option value="disabledDefault" disabled>
                            Select a month
                        </option>
                        { monthOptionData.map((optionData : T_SelectMonthOption) => {
                            return <option key={optionData.value}
                                        value={optionData.value}
                                    >
                                        {optionData.display}
                                    </option>
                        }                       
                        )}
                    </select>
        </>
    )
}