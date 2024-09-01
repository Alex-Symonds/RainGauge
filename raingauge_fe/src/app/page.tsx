import { GraphControlsWrapper } from "@/components/GraphControlsWrapper";
import dynamic from "next/dynamic";
import { useMemo } from "react";



export default function Home() {

  const Map = useMemo(() => dynamic(
    () => import('@/components/Map'),
    { 
      loading: () => <p>A map is loading</p>,
      ssr: false
    }
  ), [])

  const lat = 52.48; //52.48049047465328;
  const long = -1.89;// -1.8978672581749725;


  return (
      <main>
        <div className="container mt-2"> 
          <h1 className="d-flex flex-column">
            <span className="text-primary">Rain Gauge Readings </span>
            <small className=" fs-4 text-primary-emphasis">Birmingham, UK</small>
          </h1>
          
          <div className="row mt-5">
            <h2>Data</h2>
            <GraphControlsWrapper />
          </div>
          <div className="row mt-5">
            <h2>Location</h2>
            <Map 
              position = { [lat, long] }
              zoom = { 13 }
            />
          </div>
        </div>
      </main>
    )
}

//text-body-secondary