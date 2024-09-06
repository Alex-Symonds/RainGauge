
import { useEffect, useState } from "react";

import { T_AdjustableDateRangeOutput } from "@/util/useAdjustableDateRange";
import { convertStringToDate, strIsValidForDateCreation } from "@/util/dateStringHelpers";

import { T_DateAndDurationFormProps } from "./DateAndDurationForm";
import { T_FormErrors } from "../util/useInteractiveData";


type T_UseDateAndDurationFormProps = 
    Pick<T_AdjustableDateRangeOutput, "maxDate" | "minDate" | "updateDateRange">;

export type T_UseDateAndDurationFormOutput = 
    Pick<T_DateAndDurationFormProps, 
        "controlledDuration" 
        | "controlledStartDate" 
        | "durationOptions" 
        | "error" 
        | "updateSelectedDuration" 
        | "updateStartDate"
    > & 
    Pick<T_AdjustableDateRangeOutput, 
        "maxDate" 
        | "minDate"
    > & {
        onReset: () => void,
        warning : T_FormErrors
    };


export function useDateAndDurationForm({ 
    minDate, maxDate, updateDateRange 
    } : T_UseDateAndDurationFormProps
    ) : T_UseDateAndDurationFormOutput {

    const [startDateStr, setStartDateStr] = useState<string>("");
    const [selectedDuration, setSelectedDuration] = useState<string>("toEnd");
    const [formError, setFormError] = useState<string | null>(null);
    const [formWarning, setFormWarning] = useState<string | null>(null);

    useEffect(() => {
        if(startDateStr === "" && minDate !== ""){
            setStartDateStr(minDate.slice(0, -9));
        }
    }, [minDate]);

    useEffect(() => {
        updateGraphData();
    }, [startDateStr, selectedDuration])

    const CRITICAL_ERROR_MESSAGE = "Date and Duration has stopped working. Please use another method of selecting a date range. Sorry for the inconvenience.";

    function updateStartDate(dateStr : string){
        resetErrorAndWarning();
        if(strIsValidForDateCreation(dateStr)){
            setStartDateStr(dateStr);
        }
    }

    function updateSelectedDuration(durationValue : string){
        resetErrorAndWarning();
        if(durationOptions.findIndex(options => options.value === durationValue) !== -1){
            setSelectedDuration(durationValue);
        }
    }

    function resetErrorAndWarning(){
        setFormError(null);
        setFormWarning(null);
    }

    function onReset(){
        setStartDateStr(minDate.slice(0, -9));
        setSelectedDuration("toEnd");
        resetErrorAndWarning();
    }

    function updateGraphData(){
        const dates = calcDates();
        if(dates === null){
            return;
        }
        updateDateRange({
            start: dates.startDate,
            end: dates.endDate,
        });
    }

    function calcDates(){
        if(!inputsAreValid()){
            return null;
        }

        const index = durationOptions.findIndex(option => option.value === selectedDuration);
        const durationData = durationOptions[index];
        const startDate = convertStringToDate(`${startDateStr}T00:01:00`);
        const endDate = durationData.calcFn();

        if(checkDates(startDate, endDate)){
            return { 
                startDate,
                endDate
            };
        } else {
            return null;
        }
    }

    function inputsAreValid(){
        const index = durationOptions.findIndex(option => option.value === selectedDuration);
        if(index === -1){
            setFormError("Invalid duration selected. Try reloading the page.");
            return false;
        }

        if(!strIsValidForDateCreation(startDateStr)){
            setFormError("Invalid start date entered. Try reloading the page.");
            return false;
        }

        return true;
    }

    function checkDates(startDate : Date, endDate : Date){
        /*
            This check looks out for issues of varying degrees of severity.
            It returns "true" when it's ok to update the date range and false if not.
        */

        const minDateAsDate = new Date(minDate);
        const maxDateAsDate = new Date(maxDate);

        // This shouldn't be possible, since endDate is calculated by adding to startDate, but just in case
        if(endDate < startDate ){
            setFormError(CRITICAL_ERROR_MESSAGE);
            return false;
        }

        if(startDate > maxDateAsDate || endDate < minDateAsDate){
            setFormWarning("Dates are out of range: this could make the data do weird things.")
            return true;   
        }

        if(endDate > maxDateAsDate){
            setFormWarning("This duration goes past the end of the available data: displaying what exists.")
            return true;  
        }

        return true;
    }

    

    const durationOptions = [
        { 
            display: "One day",
            value: "thisDay",
            calcFn: () => addDays(1),
        },
        {
            display: "One week",
            value: "oneWeek",
            calcFn: () => addDays(7),
        },
        {
            display: "One month",
            value: "oneCalMonth",
            calcFn: () => calcCalMonth(1),
        },
        {
            display: "Three months",
            value: "threeCalMonths",
            calcFn: () => calcCalMonth(3),
        },
        {
            display: "End of data",
            value: "toEnd",
            calcFn: () => toEnd(),
        },
    ];

    function addDays(numDaysToAdd : number){
        const offsetToRemoveDoubleCount = -1;
        const offsetToIncludeMidnight = 1;
        const durationAsDateOffset = numDaysToAdd + offsetToRemoveDoubleCount + offsetToIncludeMidnight;

        let endDate = convertStringToDate(`${startDateStr}T00:00:00`);
        endDate.setDate(endDate.getDate() + durationAsDateOffset);
        return endDate;
    }

    function calcCalMonth(numMonthsToAdd : number){
        const startDate = convertStringToDate(`${startDateStr}T00:01:00`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + numMonthsToAdd, startDate.getDate(), 0, 0);
        return endDate;
    }

    function toEnd(){
        return new Date(maxDate);
    }


    return {
        controlledStartDate: startDateStr,
        controlledDuration: selectedDuration,
        durationOptions,
        error: {
            duration: formError
        },
        maxDate,
        minDate,
        onReset,
        updateSelectedDuration,
        updateStartDate,
        warning: {
            form: formWarning
        },
    }
}


