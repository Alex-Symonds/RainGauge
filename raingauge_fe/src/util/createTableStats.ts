import { formatTwoDigits } from "./dateStringHelpers";
import { T_RainGaugeSubtotal } from "./useRainGaugeData";

type T_WettestDriestResult = {
    heading : string,
    wettest : T_SuperlativeResult,
    driest : T_SuperlativeResult,
}
type T_SuperlativeResult = {
    count : number,
    total : number,
    description: string,
}

type T_Working = {
    description : string,
    total : number,
    numReadings: number,
}


// Obtain an array of information for use in generating a row in a "wettest and driest" table
export function createWettestDriestTableStats(filteredSortedSubtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){

    // The duration of the date range affects whether some of this data is meaningful
    // ("wettest month" is interesting over a year of data, not so much for a week)
    const durationInHours = getDurationInHoursFromSubtotalData(filteredSortedSubtotals);

    // Configure a "rowdataKit" for each row of the table
    const hourKit = rowDataKit({
        heading: "Hour",
        unitsForDescription: "hour",
        minReadingsPerUnit: numReadingsPerHour,
        convertHoursToUnits: (duration : number) => duration,
        updateResultIn: (subtotal, result, working, minReadingsPerUnit) => updateHourResult({working, subtotal, result, minReadingsPerUnit}),
        durationInHours
    });

    const dayKit = rowDataKit({
        heading: "Day", 
        unitsForDescription: "day",
        minReadingsPerUnit: numReadingsPerHour * 24,
        convertHoursToUnits: (duration : number) => duration / 24,
        updateResultIn: (subtotal, result, working, minReadingsPerUnit) => updateResult({working, subtotal, result, groupStr: getDayString(new Date(subtotal.firstTimestamp)), minReadingsPerUnit}),
        durationInHours
    });

    // If 28 days is good enough to count as a complete month for February, it's good enough to count as a complete month for the rest of the year too
    const monthKit = rowDataKit({
        heading: "Month", 
        unitsForDescription: "month",
        minReadingsPerUnit: numReadingsPerHour * 24 * 28,
        convertHoursToUnits: (duration : number) => duration / 24 / 28,
        updateResultIn: (subtotal, result, working, minReadingsPerUnit) => updateResult({working, subtotal, result, groupStr: getMonthString(new Date(subtotal.firstTimestamp)), minReadingsPerUnit}),
        durationInHours
    });

    // Put the kits in an array, in the order they should appear in the table
    const rowDataKits = [
        hourKit,
        dayKit,
        monthKit,
    ]

    // Loop through the subtotals once, updating each row for each subtotal
    for(let i = 0; i < filteredSortedSubtotals.length; i++){
        const subtotal = filteredSortedSubtotals[i];
        rowDataKits.forEach(kit => kit.update(subtotal));
    }
    rowDataKits.forEach(kit => kit.finalise());

    // Return the final results
    return rowDataKits.map(kit => kit.getResult());
}


// Collection of useful functions to manage finding the wettest and driest $UNIT of time within a time range
type T_RowDataKitProps = {
    convertHoursToUnits : (duration : number) => number, 
    durationInHours : number,
    heading : string, 
    minReadingsPerUnit : number,
    unitsForDescription : string, 
    updateResultIn: (subtotal : T_RainGaugeSubtotal, result : T_WettestDriestResult, working : T_Working, minReadingsPerUnit : number) => void, 
}

function rowDataKit({
    convertHoursToUnits, durationInHours, heading, minReadingsPerUnit, unitsForDescription, updateResultIn, 
    } : T_RowDataKitProps){

    // Reasoning: for "wettest" and "driest" to be meaningful, the date range should cover
    // at least 3 complete $UNITs. This might go a bit wrong if the user sets a custom time range 
    // that starts and ends in the middle of a $UNIT, but in that case they know what they're doing.
    const MIN_UNITS_FOR_COMPARISON = 3;
    // -------------------------------------------------------------------------------------------
    const isApplicable = convertHoursToUnits(durationInHours) >= MIN_UNITS_FOR_COMPARISON;

    let result = createResultObj(heading, isApplicable);
    let working = isApplicable
        ? { description: "", total: 0, numReadings: 0 }
        : null;

    function update(subtotal : T_RainGaugeSubtotal){
        if(isApplicable && working !== null){
            updateResultIn(subtotal, result, working, minReadingsPerUnit);
        }
    }

    function finalise(){
        if(isApplicable && working !== null){
            // If there's some straggler data in working, add that to the results
            if(working.description !== ""){
                updateWettestAndDriest(working, result, minReadingsPerUnit);
            }

            // If there's a tie for wettest or driest, the description should describe the tie, instead of showing a group string
            if(result.wettest.description === ""){
                result.wettest.description = getDescriptionForMoreThanOneResult(result.wettest.count, unitsForDescription);
            }
            if(result.driest.description === ""){
                result.driest.description = getDescriptionForMoreThanOneResult(result.driest.count, unitsForDescription);
            }
        }
    }

    function getResult(){
        return result;
    }

    return {
        update, 
        finalise,
        getResult,
    }
}


// Results object helpers
function createResultObj(heading : string, isApplicable : boolean) : T_WettestDriestResult{
    return {
        heading,
        wettest: isApplicable ? createSuperlativeObj(-Infinity) : createNASuperlativeObj(),
        driest: isApplicable ? createSuperlativeObj(Infinity) : createNASuperlativeObj(),
    };

    function createSuperlativeObj(initTotal : number) : T_SuperlativeResult{
        return {
            count: 0,
            total: initTotal,
            description: ""
        }
    }

    function createNASuperlativeObj(){
        return {
            count: 0,
            total: 0,
            replaceTotal: "N/A",
            description: "Date range is too small"
        }
    }
}


// Update functions
type T_UpdateResultProps = {
    groupStr : string,
    minReadingsPerUnit : number,
    result : T_WettestDriestResult, 
    subtotal : T_RainGaugeSubtotal, 
    working : T_Working, 
}

function updateResult({ working, subtotal, result, groupStr, minReadingsPerUnit} : T_UpdateResultProps){
    // If this record belongs in a new group, first handle the old group: run the min/max comparison, update the results, then reset working
    if(working.description !== "" && groupStr !== working.description) {
        updateWettestAndDriest(working, result, minReadingsPerUnit,);
        working.description = "";
        working.total = 0;
        working.numReadings = 0;
    }

    // Handle this record
    if(groupStr === working.description){
        working.total = working.total + parseFloat(subtotal.total);
        working.numReadings = working.numReadings + parseInt(subtotal.numReadings);
    }
    else if(working.description === ""){
        working.description = groupStr;
        working.total = parseFloat(subtotal.total);
        working.numReadings = parseInt(subtotal.numReadings);
    } 
}


function updateWettestAndDriest(working : T_Working, result : T_WettestDriestResult, minReadingsPerUnit : number){
    if(working.numReadings >= minReadingsPerUnit){
        result.wettest = getUpdatedMinMaxObject(result.wettest, working.total, working.description, working.total > result.wettest.total);
        result.driest = getUpdatedMinMaxObject(result.driest, working.total, working.description, working.total < result.driest.total); 
    }
}

function getUpdatedMinMaxObject(result : T_SuperlativeResult, total : number, description : string, wantReplace : boolean){
    let updatedCount : number;
    let updatedTotal : number;
    let updatedDescription: string;

    if(wantReplace){
        updatedCount = 1;
        updatedTotal = total;
        updatedDescription = description;
    }
    else if(total == result.total){
        updatedCount = result.count + 1;
        updatedTotal = total;
        updatedDescription = "";
    }
    else{
        updatedCount = result.count;
        updatedTotal = result.total;
        updatedDescription = result.description;
    }

    return {
        count: updatedCount,
        total: updatedTotal,
        description: updatedDescription
    }
}


/*  SPECIAL HOUR HELPERS
    When the date range gets too large, the backend stops reporting individual readings and starts reporting
    grouped subtotals. Many of these subtotals are larger than one hour, so information about individual hours
    is lost.
    
    To get around this, when the subtotal spans more than one hour, the backend keeps track of the max and min
    hours and adds that info to the subtotal.

    This means that updating the result for hours works a bit differently to day and month, because it needs
    to also be able to handle the backend's min/max data
*/
function updateHourResult({working, subtotal, result, minReadingsPerUnit} : Pick<T_UpdateResultProps, "working" | "subtotal" | "result" | "minReadingsPerUnit" >){
    if(!updateHourResultForSubtotalsWithMinMaxHourData(subtotal, result, minReadingsPerUnit)){
        updateResult({working, subtotal, result, groupStr: getHourString(new Date(subtotal.lastTimestamp)), minReadingsPerUnit});
    }
}

function updateHourResultForSubtotalsWithMinMaxHourData(subtotal : T_RainGaugeSubtotal, result : T_WettestDriestResult, minReadingsPerUnit : number){
    if(subtotal.minHour === undefined || subtotal.maxHour === undefined){
        return false;
    }

    updateOneHour(subtotal.minHour.count, subtotal.minHour.timestamp, subtotal.minHour.reading, subtotal.numReadings, result);
    updateOneHour(subtotal.maxHour.count, subtotal.maxHour.timestamp, subtotal.maxHour.reading, subtotal.numReadings, result);
    return true;

    function updateOneHour(count : string, timestamp : string, reading : string, numReadings : string, result : T_WettestDriestResult){
        const desc = parseInt(count) === 0
            ? ""
            : getHourString(new Date(timestamp));

        let dummyWorking = {
            count: 0,
            numReadings: parseInt(numReadings),
            description: desc,
            total: parseInt(reading),
        }
        updateWettestAndDriest(dummyWorking, result, minReadingsPerUnit);
    }  
}



// Group strings
function getHourString(endDate : Date){
    /*
        Note/example: readings at 06:15, 06:30, 06:45 and 07:00 should be grouped together to 
        form an hour, since the 07:00 reading covers rain that fell in the preceeding 15 mins. 
    */

    // Use Date object so the built in stuff can handle days, months and years flipping over
    let displayStart = new Date(endDate.getTime());
    let displayEnd = new Date(endDate.getTime());

    // Handle hours ticking over
    if(endDate.getMinutes() === 0){
        displayStart.setMinutes(-1);
    } else {
        displayEnd.setHours(endDate.getHours() + 1);
    }

    const dayStr = getDayString(displayStart);
    return `${formatTwoDigits(displayStart.getHours())}:01 - ${formatTwoDigits(displayEnd.getHours())}:00, ${dayStr}`;

}
    
function getDayString(date : Date){
    if(date.getMinutes() === 0 && date.getHours() === 0){
        // This could be the "01 MONTH YEAR 00:00" reading, which
        // needs to be counted in the last day of the previous month, which could also tick back the year
        date.setMinutes(-15);
    }
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
}


function getMonthString(date : Date){
    let dayToUse = new Date(date.getFullYear(), date.getMonth(), 1);
    if(date.getHours() === 0 && date.getMinutes() === 0){
        // This could be the "01 MONTH YEAR 00:00" reading, which
        // needs to be counted in month - 1, which could also tick back the year
        dayToUse.setMinutes(-10);
    }
    return `${dayToUse.toLocaleString('default', { month: 'long' })} ${ dayToUse.getFullYear() }`
}



// Simple helpers
function getDurationInHoursFromSubtotalData(filteredSortedSubtotals : T_RainGaugeSubtotal[]){
    if(filteredSortedSubtotals === undefined || filteredSortedSubtotals.length === 0){
        return 0;
    }

    const startTimestampStr = filteredSortedSubtotals[0].firstTimestamp;
    const endTimestampStr = filteredSortedSubtotals[filteredSortedSubtotals.length - 1].lastTimestamp;

    try{
        const start = new Date(startTimestampStr);
        const end = new Date(endTimestampStr);

        const diffInMs = end.getTime() - start.getTime();
        return diffInMs / 1000 / 60 / 60;
    }
    catch{
        return 0;
    }
}


function getDescriptionForMoreThanOneResult(count : number, unitStr : string){
    return `${ count } separate ${ unitStr }s`;
}

