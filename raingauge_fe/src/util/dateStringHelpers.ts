/*
    Functions to help with displaying and handling dates
*/

export function strIsValidForDateCreation(datetimeStr : string){
    const attemptDate = new Date(datetimeStr);
    return !isNaN(attemptDate.valueOf());
}

export function convertStringToDate(dateStr : string){
    return new Date(dateStr);
}

export function formatDate(input : Date | string){
    const date = typeof input == 'string'
        ? convertStringToDate(input)
        : input;

    return `${
        formatTwoDigits(date.getDate())
    }/${
        formatTwoDigits(date.getMonth()+1)
    }/${
        date.getFullYear()
    } ${
        formatTwoDigits(date.getHours())
    }:${
        formatTwoDigits(date.getMinutes())
    }`;  
}

export function formatTwoDigits(num : number){
    return num.toString().padStart(2, '0');
}