/*
    One-stop shop packaging up the hooks and resets for the multi-part form
*/

import { T_UseCustomDateRangeOutput, useCustomDateRangeForm } from "./useCustomDateRangeForm";
import { resetDateRange } from "./resetDateRange";
import { useOneMonthSelectForm, T_SelectMonthOption, T_UseOneMonthSelectFormOutput } from "./useOneMonthSelectForm";
import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";


export type T_FormErrors = {
    update: string | null
}

export type T_UseInteractiveDataOutput = {
    customDateRange : T_UseCustomDateRangeOutput,
    oneMonthSelect : T_UseOneMonthSelectFormOutput,
    reset : () => void,
}

type T_UseInteractiveDataProps = 
    Pick<T_AdjustableDateRangeOutput,
        "updateDateRange"
        | "monthOptionData"
        | "maxDate"
        | "minDate"
    >;
export function useInteractiveData({ maxDate, minDate, monthOptionData, updateDateRange } : T_UseInteractiveDataProps){
    
    const customDateRange = useCustomDateRangeForm({
        defaultStart: minDate,
        defaultEnd: maxDate,
        updateDateRange,
    });

    const oneMonthSelect = useOneMonthSelectForm({
        updateDateRange, 
        monthOptionData
    });

    function combinedReset(){
        customDateRange.onReset();

        resetDateRange({
            defaultStart: minDate,
            defaultEnd: maxDate,
            updateDateRange,
        });
    }

    return {
        customDateRange,
        oneMonthSelect,
        reset: combinedReset
    }
}