/*
    Loops through the data in the date range to find the wettest and driest

    Contents:
        || Main function
        || Create min/max finder
        || Update functions
        || Misc helpers
*/
import { T_BackendMinMaxKeys, T_RainGaugeSubtotal, T_RainGaugeSubtotalMinMax } from "../useRainGaugeData";


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


// || Create min/max finder
type T_CreateHydroMinMaxFinderProps = {
    convertHoursToUnits : (duration : number) => number, 
    descFn : (date : Date) => string,
    heading : string, 
    keys?: T_MinMaxKeys,
    minReadingsPerUnit : number,
    subtotals : T_RainGaugeSubtotal[],
    unitsForDescription : string, 
}
export function createHydroMinMaxFinder({
    convertHoursToUnits, descFn, heading, keys, minReadingsPerUnit, subtotals, unitsForDescription,
    } : T_CreateHydroMinMaxFinderProps){

    /* 
        If the user has only selected one day, it would be silly to report that one day as both the wettest
        and driest day in the range: saying the month is both the wettest and driest month is even sillier. 
        This bit is here to support "turning off" the min/max data in cases such as this.

        Reasoning for the min units: 3 units leaves space for one wettest, one driest and then 1 extra that 
        will either serve as as "also-ran", or it'll allow a bit of wiggle room in case the user sets a 
        custom time range with incomplete units at the start and end.
    */
    const MIN_UNITS_FOR_COMPARISON = 3;
    const durationInHours = getDurationInHoursFromSubtotalData(subtotals);
    const isApplicable = convertHoursToUnits(durationInHours) >= MIN_UNITS_FOR_COMPARISON;
    // -------------------------------------------------------------------------------------------
    
    const result = createMinMaxResultObj(heading, isApplicable);
    const workingGroupSubtotal : T_WorkingGroupSubtotal | null = isApplicable
        ? { description: "", total: 0, numReadings: 0, }
        : null;

    // Here's where this does the thing
    subtotals.forEach((subtotal : T_RainGaugeSubtotal) => {
        update(subtotal);
    })
    finalise();
    return getResult();

    // Below are the helper functions to make that work
    function update(subtotal : T_RainGaugeSubtotal){
        if(isApplicable && workingGroupSubtotal !== null){
            if(keys === undefined || !updateResultFromExistingMinMax({ subtotal, keys, result, descFn, })){
                updateResultFromWorking({
                    working: workingGroupSubtotal, 
                    subtotal, 
                    result, 
                    groupStr: descFn(new Date(subtotal.firstTimestamp)), 
                    minReadingsPerUnit}
                );
            }
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
}


// || Update functions
/*
    Update wettest and driest via summing up several subtotals
    Used when: the time unit we want to display is greater than the maximum subtotal size (12 hours)
    Because: getting the numbers on a "per time unit" basis will require adding together subtotals that belong to the
    same time unit. This function manages this, updating a "working" object, working out when the time unit is finished,
    then using it to update the overall wettest and driest.
*/
type T_UpdateResultFromWorkingProps = {
    groupStr : string,
    minReadingsPerUnit : number,
    result : T_WettestDriestResult, 
    subtotal : T_RainGaugeSubtotal, 
    working : T_WorkingGroupSubtotal, 
}
function updateResultFromWorking({ working, subtotal, result, groupStr, minReadingsPerUnit } : T_UpdateResultFromWorkingProps){
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
    Used when: the time unit we want to display is smaller than the subtotal size from the backend
    Because: when creating subtotals, the backend tracks min/max readings (and hours, when needed) 
    on a per-subtotal basis and adds the relevant data to the subtotal. This function looks for 
    that data and uses it to update the overall wettest and driest.
*/
type T_UpdateResultFromExistingMinMaxProps = 
    T_DescFromDate 
    & T_MinMaxKeysObj
    & {
        result : T_WettestDriestResult, 
        subtotal : T_RainGaugeSubtotal, 
    };
function updateResultFromExistingMinMax({ subtotal, keys, result, descFn } : T_UpdateResultFromExistingMinMaxProps){
    if(!(keys.minKey in subtotal) || !(keys.maxKey in subtotal) || subtotal[keys.maxKey] === undefined || subtotal[keys.minKey] === undefined){
        return false;
    }

    // @ts-ignore minHour/maxHour have the potential to be undefined and, for some reason, the checks above do not satisfy TS. I give up.
    const wettestConfig = getConfigForMinMaxUpdate(subtotal[keys.maxKey], result.wettest, parseFloat(subtotal[keys.maxKey].reading) > result.wettest.total);
    result.wettest = getUpdatedMinMaxObject(wettestConfig);

    // @ts-ignore minHour/maxHour have the potential to be undefined and, for some reason, the checks above do not satisfy TS. I give up.
    const driestConfig = getConfigForMinMaxUpdate(subtotal[keys.minKey], result.driest, parseFloat(subtotal[keys.minKey].reading) < result.driest.total);
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

    return true; 
}


/*
    Update wettest and driest by trying both approaches, with existing data first
    Used when: it's uncertain whether the time unit we want to display is greater or less than 
    the subtotal size from the backend
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

// Update helpers
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


// || Misc helpers
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


function getDescriptionForMoreThanOneResult(count : number, unitStr : string){
    return `${ count.toLocaleString() } separate ${ unitStr }s`;
}


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



