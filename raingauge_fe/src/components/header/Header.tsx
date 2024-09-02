
import styles from './Header.module.scss';

export function PageHeader(){
    return (
        <div className={styles.headerWrapper}>
            <h1 className={"d-flex flex-column"}>
                <span className="h1">Rain Gauge Readings </span>
                <small className={`fs-4 ${styles.location}`}>Birmingham, United Kingdom</small>
            </h1>
        </div>
    )
}