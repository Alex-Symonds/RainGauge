/*
    UI component for the full "set time range" form panel
*/

import { AccordionItemWrapper } from "./subcomponents/AccordionItemWrapper";
import { CustomForm, T_CustomFormProps } from "./customDateRangeForm/CustomForm";
import { OneMonthForm } from "./monthSelectForm/OneMonthForm";
import { T_OneMonthFormProps } from "./monthSelectForm/types";

import styles from './GraphForm.module.scss';
import { DateAndDurationForm, T_DateAndDurationFormProps } from "./dateAndDurationForm/DateAndDurationForm";

type T_GraphControlsProps = {
    customFormKit : T_CustomFormProps,
    dateAndDurationKit : T_DateAndDurationFormProps,
    oneMonthFormKit : T_OneMonthFormProps,
    resetGraphData: () => void,
}

export function GraphForm({
    customFormKit, dateAndDurationKit, oneMonthFormKit, resetGraphData
} : T_GraphControlsProps){

    const accordionID = 'id_formAccordion';
    const collapseOneMonthID = 'id_collapseOneMonth';
    const collapseDateAndDurationID = 'id_collapseDateAndDuration';
    const collapseCustomID = 'id_collapseCustom';
    
    return (
        <form className={ `${styles.form}` }>
            <h3 className="h5">Set Time Range</h3>

            <div className="accordion mt-4" id={accordionID}>
                <AccordionItemWrapper
                    accordionID = { accordionID }
                    isOpenOnLoad = { true }
                    title = { "Show One Month" }
                    sectionID = { collapseOneMonthID }
                >
                    <OneMonthForm
                        controlledMonthSelect = { oneMonthFormKit.controlledMonthSelect }
                        monthOptionData = { oneMonthFormKit.monthOptionData }
                        updateMonthSelect = { oneMonthFormKit.updateMonthSelect }
                    />
                </AccordionItemWrapper>

                <AccordionItemWrapper
                    accordionID = { accordionID }
                    isOpenOnLoad = { false }
                    title = { "Date & Duration" }
                    sectionID = { collapseDateAndDurationID }
                >
                    <DateAndDurationForm
                        controlledStartDate = { dateAndDurationKit.controlledStartDate }
                        controlledDuration = { dateAndDurationKit.controlledDuration }
                        durationOptions = { dateAndDurationKit.durationOptions }
                        error = { dateAndDurationKit.error }
                        maxDate = { dateAndDurationKit.maxDate }
                        minDate = { dateAndDurationKit.minDate }
                        updateSelectedDuration = { dateAndDurationKit.updateSelectedDuration }
                        updateStartDate = { dateAndDurationKit.updateStartDate }
                        warning = { dateAndDurationKit.warning }
                    />
                </AccordionItemWrapper>


                <AccordionItemWrapper
                    accordionID = { accordionID }
                    title = { "Custom Time Range" }
                    sectionID = { collapseCustomID }
                >
                    <CustomForm 
                        controlledEnd = { customFormKit.controlledEnd } 
                        controlledStart = { customFormKit.controlledStart } 
                        updateEnd = { customFormKit.updateEnd } 
                        updateGraphData = { customFormKit.updateGraphData } 
                        updateStart = { customFormKit.updateStart } 
                        errors = { customFormKit.errors } 
                        minDate = { customFormKit.minDate } 
                        maxDate = { customFormKit.maxDate } 
                    />
                </AccordionItemWrapper>

            </div>

            <div className={"mt-5"}>
                <div className="d-flex justify-content-end">
                    <button type="button" 
                        className="btn btn-outline-primary"
                        onClick = { resetGraphData }
                    >
                        Show All Data
                    </button>
                </div>
            </div>
            
        </form>
    )
}