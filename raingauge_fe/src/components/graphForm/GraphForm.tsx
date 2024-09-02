import { AccordionItemWrapper } from "./AccordionItemWrapper";
import { CustomForm, T_CustomFormProps } from "./CustomForm";
import { OneMonthForm, T_OneMonthFormProps } from "./OneMonthForm";

import styles from './GraphForm.module.scss';

type T_GraphControlsProps = 
    T_CustomFormProps
    & T_OneMonthFormProps
    & {
        resetGraphData: () => void,
    }

export function GraphForm({
    controlledEnd, controlledStart, controlledMonthSelect, updateMonthSelect, monthOptionData, resetGraphData, updateEnd, updateGraphData, updateStart, errors, min, max
} : T_GraphControlsProps){

    const accordionID = 'id_formAccordion';
    const collapseOneMonthID = 'id_collapseOneMonth';
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
                        controlledMonthSelect = { controlledMonthSelect }
                        monthOptionData = { monthOptionData }
                        updateMonthSelect = { updateMonthSelect }
                    />
                </AccordionItemWrapper>

                <AccordionItemWrapper
                    accordionID = { accordionID }
                    title = { "Custom Time Range" }
                    sectionID = { collapseCustomID }
                >
                    <CustomForm 
                        controlledEnd = { controlledEnd } 
                        controlledStart = { controlledStart } 
                        updateEnd = { updateEnd } 
                        updateGraphData = { updateGraphData } 
                        updateStart = { updateStart } 
                        errors = { errors } 
                        min = { min } 
                        max = { max } 
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