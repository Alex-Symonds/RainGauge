/*
    Loops through the data in the date range to find the wettest and driest in the following time units:
        * 15 minutes (aka individual readings)
        * Hour
        * Day
        * Month

    Contents:
        || Types
        || Main function
        || Create min/max finder
        || Create results object
        || Update functions
        || Group string generators
        || Misc helpers
*/
import { formatDateWithShortMonth, formatTwoDigits } from "./dateStringHelpers";
import { T_BackendMinMaxKeys, T_RainGaugeSubtotal, T_RainGaugeSubtotalMinMax } from "./useRainGaugeData";


// || Types
export type T_CalcWettestDriestGroupStatsOutput = {
    [key : string]: T_WettestDriestResult,
}

export type T_WettestDriestResult = {
    heading : string,
    wettest : T_HydroMinOrMaxResult,
    driest : T_HydroMinOrMaxResult,
}
type T_HydroMinOrMaxResult = {
    count : number,
    total : number,
    replaceTotal? : string,
    description: string,
}

type T_WorkingGroupSubtotal = {
    description : string,
    total : number,
    numReadings: number,
}

// || Main function
// Obtain an array of information for use in generating a row in a "wettest and driest" table
export function calcWettestDriestGroupStats(filteredSortedSubtotals : T_RainGaugeSubtotal[], numReadingsPerHour : number){

    if(filteredSortedSubtotals === undefined || filteredSortedSubtotals === null || filteredSortedSubtotals.length === 0){
        return {};
    }

    // The duration of the date range will affect whether some of this data is meaningful
    // ("wettest month" is interesting over a year of data, not so much for a week)
    const durationInHours = getDurationInHoursFromSubtotalData(filteredSortedSubtotals);

    // Configure a "hydroMinMaxFinder" for each relevant unit
    const individualMinMaxFinder = createHydroMinMaxFinder({
        heading: "Reading",
        unitsForDescription: "reading",
        keyForOutput: "reading",
        minReadingsPerUnit: 1,
        convertHoursToUnits: (duration : number) => duration * numReadingsPerHour,
        updateResult: (subtotal, result, working, minReadingsPerUnit) => 
            updateResultFromExistingMinMax({ subtotal, result, descFn: formatDateWithShortMonth, keys: { minKey: 'min', maxKey: 'max' } }),
        durationInHours
    });

    const hourMinMaxFinder = createHydroMinMaxFinder({
        heading: "Hour",
        unitsForDescription: "hour",
        keyForOutput: "hour",
        minReadingsPerUnit: numReadingsPerHour,
        convertHoursToUnits: (duration : number) => duration,
        updateResult: (subtotal, result, working, minReadingsPerUnit) => 
            updateResultFromExistingOrWorking({working, subtotal, result, minReadingsPerUnit, descFn: getHourString, keys: { minKey: 'minHour', maxKey: 'maxHour' } }),
        durationInHours
    });

    const dayMinMaxFinder = createHydroMinMaxFinder({
        heading: "Day", 
        unitsForDescription: "day",
        keyForOutput: "day",
        minReadingsPerUnit: numReadingsPerHour * 24,
        convertHoursToUnits: (duration : number) => duration / 24,
        updateResult: (subtotal, result, working, minReadingsPerUnit) => 
            updateResultFromWorking({working, subtotal, result, groupStr: getDayString(new Date(subtotal.firstTimestamp)), minReadingsPerUnit}),
        durationInHours
    });

    // Minimum month duration is a bit awkward due to the varying durations.
    // The minimum duration is only used to disqualify "incomplete" months, so my thinking is:
    // If 28 days is good enough to count as a complete month for February, it's good 
    // enough to count as a complete month for the rest of the year too
    const COMPLETE_MONTH_IN_DAYS = 28;
    const monthMinMaxFinder = createHydroMinMaxFinder({
        heading: "Month",
        unitsForDescription: "month",
        keyForOutput: "month",
        minReadingsPerUnit: numReadingsPerHour * 24 * COMPLETE_MONTH_IN_DAYS,
        convertHoursToUnits: (duration : number) => duration / 24 / COMPLETE_MONTH_IN_DAYS,
        updateResult: (subtotal, result, working, minReadingsPerUnit) => 
            updateResultFromWorking({working, subtotal, result, groupStr: getMonthString(new Date(subtotal.firstTimestamp)), minReadingsPerUnit}),
        durationInHours
    });

    // Put the kits in an array, in the order they should appear in the table
    const minMaxFinders = [
        individualMinMaxFinder,
        hourMinMaxFinder,
        dayMinMaxFinder,
        monthMinMaxFinder,
    ]

    // Loop through the subtotals once, updating each row for each subtotal
    for(let i = 0; i < filteredSortedSubtotals.length; i++){
        const subtotal = filteredSortedSubtotals[i];
        minMaxFinders.forEach(mmFinder => mmFinder.update(subtotal));
    }
    minMaxFinders.forEach(mmFinder => mmFinder.finalise());

    // Return the final results
    return minMaxFinders.reduce((acc, mmFinder) => {
        return {
            ...acc,
            [mmFinder.key]: mmFinder.getResult()
        }
    }, {});
}


// || Create min/max finder
// Collection of useful functions to manage finding the wettest and driest $UNIT of time within a time range
type T_CreateHydroMinMaxFinderProps = {
    convertHoursToUnits : (duration : number) => number, 
    durationInHours : number,
    heading : string, 
    keyForOutput : string,
    minReadingsPerUnit : number,
    unitsForDescription : string, 
    updateResult: (subtotal : T_RainGaugeSubtotal, result : T_WettestDriestResult, working : T_WorkingGroupSubtotal, minReadingsPerUnit : number) => void | boolean, 
}
function createHydroMinMaxFinder({
    convertHoursToUnits, durationInHours, heading, keyForOutput, minReadingsPerUnit, unitsForDescription, updateResult
    } : T_CreateHydroMinMaxFinderProps){

    // Reasoning: for "wettest" and "driest" to be meaningful, the date range should cover
    // at least 3 complete $UNITs. This might go a bit wrong if the user sets a custom time range 
    // that starts and ends in the middle of a $UNIT, but in that case they know what they're doing.
    const MIN_UNITS_FOR_COMPARISON = 3;
    // -------------------------------------------------------------------------------------------
    const isApplicable = convertHoursToUnits(durationInHours) >= MIN_UNITS_FOR_COMPARISON;

    const result = createMinMaxResultObj(heading, isApplicable);
    const workingGroupSubtotal : T_WorkingGroupSubtotal | null = isApplicable
        ? { description: "", total: 0, numReadings: 0, }
        : null;

    function update(subtotal : T_RainGaugeSubtotal){
        if(isApplicable && workingGroupSubtotal !== null){
            updateResult(subtotal, result, workingGroupSubtotal, minReadingsPerUnit);
        }
    }

    function finalise(){
        if(isApplicable && workingGroupSubtotal !== null){

            /*
                Complete groups are considered for min/max at the start of the /next/ loop, so "working"
                could easily contain a complete group at this stage. Also, due to the variable duration
                of months, it's entirely possible that an incomplete month (from a calendar perspective)
                is considered a complete month for min/max qualification purposes
            */
            if(workingGroupSubtotal.description !== ""){
                updateWettestAndDriestFromWorking(workingGroupSubtotal, result, minReadingsPerUnit);
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
        key: keyForOutput,
        update, 
        finalise,
        getResult,
    }
}


// || Create results object
function createMinMaxResultObj(heading : string, isApplicable : boolean) : T_WettestDriestResult{
    return {
        heading,
        wettest: isApplicable ? createSuperlativeObj(-Infinity) : createNASuperlativeObj(),
        driest: isApplicable ? createSuperlativeObj(Infinity) : createNASuperlativeObj(),
    };

    function createSuperlativeObj(initTotal : number) : T_HydroMinOrMaxResult{
        return {
            count: 0,
            total: initTotal,
            description: ""
        }
    }

    function createNASuperlativeObj() : T_HydroMinOrMaxResult{
        return {
            count: 0,
            total: 0,
            replaceTotal: "N/A",
            description: "Date range is too small"
        }
    }
}



// || Update functions
/*
    Update wettest and driest via summing up several subtotals
    Used when: the working time unit is greater than the maximum subtotal size from the backend (which is 12 hrs)
    Because: getting the numbers for the time unit will require adding together several subtotals. This function 
    manages this, updating a "working" object, working out when it's "finished" and then comparing it to 
    wettest/driest.
*/
type T_UpdateResultFromWorkingProps = {
    groupStr : string,
    minReadingsPerUnit : number,
    result : T_WettestDriestResult, 
    subtotal : T_RainGaugeSubtotal, 
    working : T_WorkingGroupSubtotal, 
}
function updateResultFromWorking({ working, subtotal, result, groupStr, minReadingsPerUnit} : T_UpdateResultFromWorkingProps){
    // If this record belongs in a new group, first handle the old group: run the min/max comparison, update the results, then reset working
    if(working.description !== "" && groupStr !== working.description) {
        updateWettestAndDriestFromWorking(working, result, minReadingsPerUnit);
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


/*
    Update wettest and driest using data already within the subtotals
    Used when: the working time unit is less than the subtotal size from the backend
    Because: every subtotal contains data about the min and max readings in the range it 
    covers; if its large enough, it'll have minHour / maxHour as well. This data can be
    extracted and then compared to the wettest / driest.
*/
type T_UpdateResultFromExistingMinMaxProps = 
    T_DescFromDate 
    & T_MinMaxKeysObj
    & {
        subtotal : T_RainGaugeSubtotal, 
        result : T_WettestDriestResult, 
    };
function updateResultFromExistingMinMax({ subtotal, keys, result, descFn } : T_UpdateResultFromExistingMinMaxProps){
    if(!(keys.minKey in subtotal) || !(keys.maxKey in subtotal) || subtotal[keys.maxKey] === undefined || subtotal[keys.minKey] === undefined){
        return false;
    }

    const maxObj = subtotal[keys.maxKey] === undefined
        ? getEmptyExistingSubtotal()
        : subtotal[keys.maxKey];

    const minObj = subtotal[keys.minKey] === undefined
        ? getEmptyExistingSubtotal()
        : subtotal[keys.minKey];

    // @ts-ignore minHour/maxHour have the potential to be undefined and the checks above do not satisfy TS. I give up.
    const wettestConfig = getConfigForMinMaxUpdate(maxObj, result.wettest, parseFloat(maxObj.reading) > result.wettest.total);
    result.wettest = getUpdatedMinMaxObject(wettestConfig);

    // @ts-ignore minHour/maxHour have the potential to be undefined and The checks above do not satisfy TS. I give up.
    const driestConfig = getConfigForMinMaxUpdate(minObj, result.driest, parseFloat(minObj.reading) < result.driest.total);
    result.driest = getUpdatedMinMaxObject(driestConfig);

    function getConfigForMinMaxUpdate(existing : T_RainGaugeSubtotalMinMax, resultPortion : T_HydroMinOrMaxResult, wantReplace : boolean){
        return {
            incrementBy: parseInt(existing.count),
            newDescription: descFn(new Date(existing.timestamp)),
            newTotal: parseFloat(existing.reading),
            result: resultPortion,
            wantReplace,
        }
    }

    function getEmptyExistingSubtotal(){
        return {
            count : "",
            timestamp : "",
            reading: "",
        }
    }

    return true; 
}


/*
    Update wettest and driest by trying both approaches, with existing data first
    Used when: it's uncertain whether the working time unit is greater or less than the subtotal size from the backend
*/
type T_DescFromDate = {
    descFn : (date : Date) => string,
}
type T_MinMaxKeysObj = {
    keys: T_MinMaxKeys
}
type T_MinMaxKeys = {
    minKey : T_BackendMinMaxKeys,
    maxKey : T_BackendMinMaxKeys,
}
function updateResultFromExistingOrWorking({ 
    working, subtotal, result, minReadingsPerUnit, descFn, keys 
    } : T_UpdateResultFromExistingMinMaxProps 
        & Pick<T_UpdateResultFromWorkingProps, "minReadingsPerUnit" | "result" | "subtotal" | "working"   >
    ){

    if(!updateResultFromExistingMinMax({ 
        subtotal, 
        keys,
        result, 
        descFn,
    })){
        updateResultFromWorking({working, subtotal, result, groupStr: descFn(new Date(subtotal.lastTimestamp)), minReadingsPerUnit});
    }
}


function updateWettestAndDriestFromWorking(working : T_WorkingGroupSubtotal, result : T_WettestDriestResult, minReadingsPerUnit : number){
    const incrementBy = 1;
    if(working.numReadings >= minReadingsPerUnit){

        result.wettest = getUpdatedMinMaxObject({
            incrementBy,
            newDescription: working.description,
            newTotal: working.total,
            result: result.wettest,
            wantReplace: working.total > result.wettest.total,
        });

        result.driest = getUpdatedMinMaxObject({
            incrementBy,
            newDescription: working.description,
            newTotal: working.total,
            result: result.driest,
            wantReplace: working.total < result.driest.total,
        }); 

    }
}


type T_GetUpdatedMinMaxObjectProps = {
    incrementBy : number,
    newDescription : string, 
    newTotal : number, 
    result : T_HydroMinOrMaxResult, 
    wantReplace : boolean, 
}
function getUpdatedMinMaxObject({ newDescription, incrementBy, result, newTotal, wantReplace } : T_GetUpdatedMinMaxObjectProps){
    let updatedCount : number;
    let updatedTotal : number;
    let updatedDescription: string;

    if(wantReplace){
        updatedCount = 1;
        updatedTotal = newTotal;
        updatedDescription = newDescription;
    }
    else if(newTotal === result.total){
        updatedCount = result.count + incrementBy;
        updatedTotal = result.total;
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



/* 
    || Group string generators
    These are doing double duty.
    1) They're displayed on the page when there's only one "winning" time unit as the "description"
    2) Since, by definition, they can be derived from timestamps and are unique for each possible group,
       I'm also using them as a group identifier for "working" updates. If this timestamp would generate a
       different description, that implies it's part of a different group, so the previous group is finished.
*/
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



// || Misc helpers
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
    return `${ count.toLocaleString() } separate ${ unitStr }s`;
}

