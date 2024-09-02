import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";
import { T_DateRange } from "../../../util/useAdjustableDateRange";

type T_ResetDateRangeProps = {
    defaultStart : string, 
    defaultEnd : string,
    updateDateRange : (value : T_DateRange) => void,   
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
