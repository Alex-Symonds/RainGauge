import { StatsCard, T_StatsCardProps } from "./StatsCard";

import { T_StatsDataOutput } from "../../util/createStatsData";

type T_StatsCardsProps = {
    statsData: T_StatsDataOutput
}


export function StatsCards({ statsData } : T_StatsCardsProps){
    return (
        <>
    { statsData !== null ?
        <div className={`container d-flex gap-3 flex-wrap`}>
            { statsData.map((record: T_StatsCardProps, idx: number) => {
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