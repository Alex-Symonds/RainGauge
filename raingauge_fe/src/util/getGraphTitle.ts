/* 
    Generate a title for the graph, showing the timestamps of the first and last data point in the selected time range
    (e.g. Suppose the user picked an end time of "23:59". Readings are at 15 min intervals, so the last data points 
    would be at 23:45, therefore "23:45" is displayed)
*/

import { formatDate } from "./dateStringHelpers";
import { T_RainGaugeReading } from "./useRainGaugeData";

export function getTimeRangeGraphTitle(selectedData : T_RainGaugeReading[]){
    selectedData = selectedData === null || selectedData === undefined || !Array.isArray(selectedData) || selectedData.length === 0
        ? [{ reading: '0', timestamp: "01/01/1900T00:00" }]
        : selectedData;

    const startStr = formatDate(selectedData[0].timestamp);
    const endStr = formatDate(selectedData[selectedData.length - 1].timestamp);

    // Plotly has no support for title word wrapping and requires users to pass in their own "<br>" tags
    return `Data from ${startStr}<br>to ${endStr}`;
}
