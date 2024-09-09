
import styles from './Loading.module.scss';

export function Loading(){

    return  <div className={`position-absolute top-0 start-0 end-0 bottom-0 d-flex justify-content-center align-items-center`}>
            <div className={`spinner-border ${styles.loadingSpinner}`} role="status">
                <span className="visually-hidden">Loading...</span>
             </div>
             </div>
}