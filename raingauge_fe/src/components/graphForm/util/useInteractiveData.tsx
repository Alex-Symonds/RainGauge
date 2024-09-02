/*
    One-stop shop packaging up the hooks and resets for the multi-part form
*/

import { useCustomDateRangeForm } from "./useCustomDateRangeForm";
import { resetDateRange } from "./resetDateRange";
import { useOneMonthSelectForm, T_SelectMonthOption } from "./useOneMonthSelectForm";


export type T_FormErrors = {
    update: string | null
}

type T_UseInteractiveDataProps = {
    updateDateRange : any, 
    minDate : string,
    maxDate : string,
    monthOptionData : T_SelectMonthOption[]
}

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