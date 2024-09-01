// import Plot from 'react-plotly.js';
'use client'
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

type T_GraphProps = {
    title : string,
    xCoords : string[], 
    yCoords : number[],
}
//style={{width:"500px",height:"500px;"}}

export function Graph({ xCoords, yCoords, title } : T_GraphProps){
    return <div id="tester" className="container">
        <Plot
            //@ts-ignore
            data={[
                    {
                        x: xCoords ?? [],
                        y: yCoords ?? [],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'blue' },
                    },

            ]}
            layout={ {width: 500, height: 400, title } } 
        />
    </div>
}
