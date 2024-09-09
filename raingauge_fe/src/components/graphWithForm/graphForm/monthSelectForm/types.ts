import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";

// Package to support <select> for months
export type T_SelectMonthOption = {
    display : string,
    value : string,
    startTimestamp : string,
    endTimestamp : string,
}

export type T_UseOneMonthSelectFormOutput = 
    T_OneMonthFormProps
    & {
        error : string | null
    };

export type T_OneMonthFormProps = {
    controlledMonthSelect : string,
    monthOptionData : T_SelectMonthOption[],
    updateMonthSelect : (value : string) => void,
}

export type T_UseOneMonthSelectFormProps = 
    Pick<T_AdjustableDateRangeOutput, 
        "minDate"
        | "maxDate"
        | "updateDateRange"
    >;

