'use client'

import { PageHeader } from "@/components/header/Header";
import { MapPanel } from "@/components/map/MapPanel";
import { StatsCards } from "@/components/statsCards/StatsCards";

import { GraphWithForm } from "@/components/GraphWithForm";
import { useInteractiveData } from "@/components/graphForm/util/useInteractiveData";

import { useRainGaugeData } from "@/util/useRainGaugeData";
import { useAdjustableDateRange } from "@/util/useAdjustableDateRange";
import { splitIntoCoords } from "@/util/splitIntoCoords";
import { getTimeRangeGraphTitle } from "@/util/getGraphTitle";


export default function Home() {
  const rainData = useRainGaugeData();
  const dataInDateRange = useAdjustableDateRange(rainData);

  const formKit = useInteractiveData({
    updateDateRange: dataInDateRange.updateDateRange,
    minDate: dataInDateRange.minDate,
    maxDate: dataInDateRange.maxDate,
  });

  const graphCoords = splitIntoCoords(dataInDateRange.data);
  const graphTitle = getTimeRangeGraphTitle(dataInDateRange.data);

  return (
      <main>
        <div className="container mt-4"> 
          <PageHeader 
            locationName = { rainData.locationName }
          />

          <div className="row mt-5"> 
          { rainData.isLoading ?
            <p>Loading...</p>
            :
            <GraphWithForm 
              title = { graphTitle }
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
            <MapPanel
              data = { rainData }
            />
          </div>
        </div>
      </main>
    )
}