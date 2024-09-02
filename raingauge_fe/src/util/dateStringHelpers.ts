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

    function format(num : number){
        return num.toString().padStart(2, '0');
    }

    return `${
        format(date.getDate())
    }/${
        format(date.getMonth()+1)
    }/${
        date.getFullYear()
    } ${
        format(date.getHours())
    }:${
        format(date.getMinutes())
    }`;  
}