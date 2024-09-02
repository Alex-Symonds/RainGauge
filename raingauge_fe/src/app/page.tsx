'use client'

import { GraphWithForm } from "@/components/graph/GraphWithForm";
import { useRainGaugeData } from "@/util/useRainGaugeData";


import { useTimeSeriesForm } from "@/util/useTimeSeriesForm";
import { PageHeader } from "@/components/header/Header";
import { MapPanel } from "@/components/map/MapPanel";
import { StatsCards } from "@/components/statsCards/StatsCards";
import { useDynamicTimeSeries } from "@/util/useDynamicTimeSeries";
import { splitIntoCoords } from "@/util/splitIntoCoords";


export default function Home() {
  const rainData = useRainGaugeData();
  const graphData = useDynamicTimeSeries(rainData);
  const formKit = useTimeSeriesForm({
    updateDateRange: graphData.updateDateRange,
    defaultStart: graphData.minDate,
    defaultEnd: graphData.maxDate,
  });
  const graphCoords = splitIntoCoords(graphData.data);

  return (
      <main>
        <div className="container mt-4"> 
          <PageHeader />

          <div className="row mt-5"> 
          { rainData.isLoading ?
            <p>Loading...</p>
            :
            <GraphWithForm 
              title = { graphData.getTimeRangeGraphTitle() }
              xCoords = { graphCoords.xCoords }
              yCoords = { graphCoords.yCoords }
              formKit = { formKit }
            />
          }
          </div>

          {graphData.data.length !== 0 ?
          <div className="row mt-5">
            <StatsCards 
              data = { graphData.data }
            />
          </div>
          : null
          }

          <div className="row mt-5">
            <div className="col-12 col-lg-6 col-xl-7 col-xxl-8">
              PLACEHOLDER
            </div>
            <MapPanel
              data = { rainData }
            />
          </div>
        </div>
      </main>
    )
}

//text-body-secondary