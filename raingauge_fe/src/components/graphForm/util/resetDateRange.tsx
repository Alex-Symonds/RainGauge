import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";
import { T_AdjustableDateRangeOutput } from "../../../util/useAdjustableDateRange";

type T_ResetDateRangeProps = 
    Pick<T_AdjustableDateRangeOutput, 
        "updateDateRange"
    >
    & {
    defaultStart : string, 
    defaultEnd : string, 
}

export function resetDateRange({defaultStart, defaultEnd, updateDateRange} : T_ResetDateRangeProps){
    if(strIsValidForDateCreation(defaultStart) && strIsValidForDateCreation(defaultEnd)){
        const dateRange = {
            start: convertStringToDate(defaultStart),
            end: convertStringToDate(defaultEnd),
        }
        updateDateRange(dateRange); 
    }
}
