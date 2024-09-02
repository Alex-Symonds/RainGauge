import dynamic from "next/dynamic";
import { useMemo } from "react";

import styles from './MapPanel.module.scss';

export function MapPanel({ data } : any){
    // Apparently next's server-side rendering can clash with Leaflet and importing this way helps
    const Map = useMemo(() => dynamic(
        () => import('@/components/map/Map'),
        { 
        loading: () => <p>A map is loading</p>,
        ssr: false
        }
    ), [])

    return (
        <div className={`col-12 col-lg-6 col-xl-5 col-xxl-4 pb-3 mb-4 ${styles.panel}`}>
            <h2 className="mb-4">Location</h2>
            <Map 
                position = { [data.lat, data.long] }
                zoom = { 13 }
            />
            <dl>
                <dt>Longitude</dt>
                <dl>{ data.long }</dl>

                <dt>Latitude</dt>
                <dl>{ data.lat }</dl>
            </dl>
        </div>
    )
}