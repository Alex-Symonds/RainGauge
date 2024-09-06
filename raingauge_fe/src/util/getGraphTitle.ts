/* 
    Generate a title for the graph
*/

import { formatDate, strIsValidForDateCreation } from "./dateStringHelpers";


export function getTimeRangeGraphTitle(startDateStr : string, endDateStr : string){
    if(strIsValidForDateCreation(startDateStr) && strIsValidForDateCreation(endDateStr)){
        const startStr = formatDate(startDateStr);
        const endStr = formatDate(endDateStr);
    
        // Plotly has no support for title word wrapping and requires users to pass in their own "<br>" tags
        return `Data from ${startStr}<br>to ${endStr}`;
    }
    return "Data error";
}