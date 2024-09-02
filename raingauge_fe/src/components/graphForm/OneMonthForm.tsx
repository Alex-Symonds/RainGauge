
import { T_SelectMonthOption } from "./util/useOneMonthSelectForm";

export type T_OneMonthFormProps = {
    controlledMonthSelect : string,
    monthOptionData : T_SelectMonthOption[],
    updateMonthSelect : (value : string) => void,
}


export function OneMonthForm({ controlledMonthSelect, monthOptionData, updateMonthSelect } : T_OneMonthFormProps){
    const idMonthSelect = "id_formInput_monthSelect";

    return (
        <>
                    <label htmlFor={idMonthSelect} className="form-label">Select Month</label>
                    <select className="form-select"
                        name = { "selectOneMonth" }
                        value = { controlledMonthSelect }
                        onChange = { (e) => updateMonthSelect(e.target.value) }
                    >
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