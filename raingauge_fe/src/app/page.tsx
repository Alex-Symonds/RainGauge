'use client'

import { GraphWithForm } from "@/components/GraphWithForm";
import { useRainGaugeData } from "@/util/useRainGaugeData";


import { PageHeader } from "@/components/header/Header";
import { MapPanel } from "@/components/map/MapPanel";
import { StatsCards } from "@/components/statsCards/StatsCards";
import { useAdjustableDateRange } from "@/util/useAdjustableDateRange";
import { splitIntoCoords } from "@/util/splitIntoCoords";
import { useInteractiveData } from "@/components/graphForm/util/useInteractiveData";


export default function Home() {

  const rainData = useRainGaugeData();
  const dataInDateRange = useAdjustableDateRange(rainData);
  const formKit = useInteractiveData({
    updateDateRange: dataInDateRange.updateDateRange,
    minDate: dataInDateRange.minDate,
    maxDate: dataInDateRange.maxDate,
    monthOptionData: dataInDateRange.monthOptionData,
  });

  const graphCoords = splitIntoCoords(dataInDateRange.data);

  return (
      <main>
        <div className="container mt-4"> 
          <PageHeader />

          <div className="row mt-5"> 
          { rainData.isLoading ?
            <p>Loading...</p>
            :
            <GraphWithForm 
              title = { dataInDateRange.getTimeRangeGraphTitle() }
              xCoords = { graphCoords.xCoords }
              yCoords = { graphCoords.yCoords }
              formKit = { formKit }
            />
          }
          </div>

          {dataInDateRange.data.length !== 0 ?
          <div className="row mt-5">
            <StatsCards 
              data = { dataInDateRange.data }
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