import { formatDate } from "@/util/dateStringHelpers";

type T_StatsAccumulator = {
    total: number,
    min: number,
    max: number,
}

export function createStatsData(filteredData : any[]) : null | any[]{

    const READINGS_PER_DAY = 4 * 24;

    if(filteredData.length === 0){
        return null;
    }

    const stats = filteredData.reduce((acc : T_StatsAccumulator, curr : any) => {
        return {
            total: acc.total + parseFloat(curr.reading),
            max: Math.max(acc.max, parseFloat(curr.reading)),
            min: Math.min(acc.min, parseFloat(curr.reading)),
        }
    }, { total: 0, min: Infinity, max: -Infinity });

    const totalObj = {
        image: "?",
        title: "Total",
        main: formatWithMM(stats.total),
        subtitle: `${filteredData.length.toLocaleString()} readings over ${ Math.round(filteredData.length/READINGS_PER_DAY) } days`
    }

    const numAtMax = filteredData.filter(record => parseFloat(record.reading) === stats.max).length;
    const maxObj = {
        image: "?",
        title: "High",
        main: formatWithMM(stats.max),
        subtitle: numAtMax === 1
            ? formatDate(filteredData.find(record => parseFloat(record.reading) === stats.max)?.timestamp)
            : createMinMaxSubtitle(numAtMax)
    }

    const numAtMin = filteredData.filter(record => parseFloat(record.reading) === stats.min).length;
    const minObj = {
        image: "?",
        title: "Low",
        main: formatWithMM(stats.min),
        subtitle: numAtMin === 1
            ? formatDate(filteredData.find(record => record.reading === stats.min)?.timestamp)
            : createMinMaxSubtitle(numAtMin)
    }

    const averageObj = {
        image: "?",
        title: "Average",
        main: filteredData.length === 0 ? formatWithMM(0) : formatWithMM(stats.total / filteredData.length),
        subtitle: "per 15 mins"
    }

    function formatWithMM(num : number){
        return `${Math.round(num * 100) / 100} mm`;
    }

    function createMinMaxSubtitle(num : number){
        return `Occurred ${num.toLocaleString()} times`
    }

    return [totalObj, maxObj, minObj, averageObj];
}
