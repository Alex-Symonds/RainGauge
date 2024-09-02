'use client'
/*
    UI component displaying a Plotly map
*/

import dynamic from "next/dynamic";
import styles from './Graph.module.scss';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

type T_GraphProps = {
    title : string,
    xCoords : string[],
    yCoords : number[],
}

export function Graph({ xCoords, yCoords, title } : T_GraphProps){
    return <div id="tester" className={`container rounded ${styles.graphContainer}`}>
        <Plot
            //@ts-ignore (TypeScript is fussing, but since this is a third-party thing and it works, TS can shush)
            data={[
                    {
                        x: xCoords ?? [],
                        y: yCoords ?? [],
                        type: 'scatter',
                        mode: 'lines',
                        marker: { color: 'DodgerBlue' },
                    },

            ]}
            layout={ { title } } 
            useResizeHandler={true}
            style={{width: "100%", height: "100%"}}
            margin={{t: 0, b: 0, l: 0, r: 0}}
        />
    </div>
}
