/*
    One-stop shop packaging up the hooks and resets for the multi-part form
*/

import { T_UseCustomDateRangeOutput, useCustomDateRangeForm } from "../customDateRangeForm/useCustomDateRangeForm";
import { resetDateRange } from "./resetDateRange";
import { useOneMonthSelectForm } from "../monthSelectForm/useOneMonthSelectForm";
import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";
import { T_UseOneMonthSelectFormOutput } from "../monthSelectForm/types";
import { T_UseDateAndDurationFormOutput, useDateAndDurationForm } from "../dateAndDurationForm/useDateAndDurationForm";


export type T_FormErrors = {
    [key: string]: string | null
}

export type T_UseInteractiveDataOutput = {
    customDateRange : T_UseCustomDateRangeOutput,
    dateAndDuration : T_UseDateAndDurationFormOutput,
    oneMonthSelect : T_UseOneMonthSelectFormOutput,
    reset : () => void,
}

type T_UseInteractiveDataProps = 
    Pick<T_AdjustableDateRangeOutput,
        "updateDateRange"
        | "maxDate"
        | "minDate"
    >;

export function useInteractiveData({ maxDate, minDate, updateDateRange } : T_UseInteractiveDataProps){
    
    const customDateRange = useCustomDateRangeForm({
        minDate,
        maxDate,
        updateDateRange,
    });

    const oneMonthSelect = useOneMonthSelectForm({
        minDate,
        maxDate,
        updateDateRange
    });

    const dateAndDuration = useDateAndDurationForm({
        minDate,
        maxDate,
        updateDateRange
    });

    function combinedReset(){
        customDateRange.onReset();
        dateAndDuration.onReset();
        oneMonthSelect.onReset();

        resetDateRange({
            defaultStart: minDate,
            defaultEnd: maxDate,
            updateDateRange,
        });
    }

    return {
        customDateRange,
        dateAndDuration,
        oneMonthSelect,
        reset: combinedReset
    }
}