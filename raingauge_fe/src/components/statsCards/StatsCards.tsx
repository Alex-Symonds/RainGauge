import { StatsCard } from "./StatsCard";

import { T_RainGaugeReading } from "@/util/useRainGaugeData";
import { createStatsData } from "./createStatsData";


type T_StatsCardsProps = {
    data : T_RainGaugeReading[],
}

export function StatsCards({ data } : T_StatsCardsProps){
    const statsData = createStatsData(data);
    return (
        <>
    { statsData !== null ?
        <div className={`container d-flex gap-3 flex-wrap`}>
            { statsData.map((record: any, idx: number) => {
                return <StatsCard key={`${record.title.replaceAll(" ", "")}-${idx}`}
                    title = { record.title }
                    main = { record.main }
                    subtitle = { record.subtitle }
                />
            })}
        </div>
        : null
    }
        </>
    )
}