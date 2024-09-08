import dynamic from "next/dynamic";
import { useMemo } from "react";

import styles from './MapPanel.module.scss';

export function MapPanel({ data } : any){
    // Apparently Next's server-side rendering can clash with Leaflet and importing in this way helps
    const Map = useMemo(() => dynamic(
        () => import('@/components/map/Map'),
        { 
        loading: () => <p>A map is loading</p>,
        ssr: false
        }
    ), [])

    return (
        <div className={`col-12 col-xl-4 pb-3 mt-5 mt-xl-0 mb-4 ${styles.panel}`}>
            <h2 className="mb-4">Rain Gauge Info</h2>
            <div className="row">
                <div className="col-6 col-xl-12">
                    <Map 
                        position = { [data.lat, data.long] }
                        zoom = { 13 }
                    />
                </div>
                <div className="col-6 col-xl-12">
                    <dl>
                        <dt>Name</dt>
                        <dl>{ data.gaugeName }</dl>

                        <dt>Location</dt>
                        <dl>{ data.locationName }</dl>

                        <dt>Longitude</dt>
                        <dl>{ data.long }</dl>

                        <dt>Latitude</dt>
                        <dl>{ data.lat }</dl>
                    </dl>
                </div>
            </div>
        </div>
    )
}