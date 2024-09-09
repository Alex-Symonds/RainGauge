import styles from './Header.module.scss';

export function PageHeader({ locationName } : { locationName : string }){
    locationName = locationName === undefined ? "Somewhere on Earth" : locationName;
    return (
        <div className={styles.headerWrapper}>
            <h1 className={"d-flex flex-column"}>
                <span className="h1">Rain Gauge Readings </span>
                <small className={`fs-4 ${styles.location}`}>{ locationName }</small>
            </h1>
        </div>
    )
}