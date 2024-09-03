/*
    Wrapper implementing Bootstrap's accordion item
*/

import { ReactNode } from "react";
import styles from './AccordionItemWrapper.module.scss';

type T_AccordionItemWrapper = {
    accordionID : string,
    isOpenOnLoad? : boolean,
    title : string,
    sectionID : string,
    children : ReactNode
}

export function AccordionItemWrapper({ accordionID, isOpenOnLoad, title, sectionID, children } : T_AccordionItemWrapper){
    isOpenOnLoad = isOpenOnLoad === undefined ? false : isOpenOnLoad;
    return (
        <div className="accordion-item">
            <h4 className="accordion-header">
                <button className={`accordion-button${isOpenOnLoad ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#${sectionID}`} aria-expanded={isOpenOnLoad} aria-controls={sectionID}>
                    { title }
                </button>
            </h4>
            <div id={sectionID} className={`accordion-collapse collapse${isOpenOnLoad ? " show" : ""}`} data-bs-parent={`#${accordionID}`}>
                <div className="accordion-body">
                    { children }
                </div>
            </div>
        </div>
    )
}