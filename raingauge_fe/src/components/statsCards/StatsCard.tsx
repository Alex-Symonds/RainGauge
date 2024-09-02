import styles from './StatsCard.module.scss';


export type T_StatsCardProps = {
    title : string,
    main : string,
    subtitle? : string,
}

export function StatsCard({ title, main, subtitle } : T_StatsCardProps){
    return (
        <div className={`card ${styles.card}`}>
            <div className={`card-header d-flex ${styles.header}`}>
                <dt className="h4 mb-0 lh-1">{ title }</dt>
            </div>
            <div className="card-body d-flex justify-content-center mt-2">
                <dl className="d-flex flex-column">
                    <strong className="fs-2 lh-1">{ main }</strong>
                    <small>{ subtitle ?? "" }</small>
                </dl>
            </div>
        </div>
    )
}