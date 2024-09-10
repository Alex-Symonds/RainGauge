'use client'

import { PageHeader } from "@/components/header/Header";
import { MapPanel } from "@/components/map/MapPanel";
import { StatsCards } from "@/components/statsCards/StatsCards";

import { GraphWithForm } from "@/components/graphWithForm/GraphWithForm";
import { useInteractiveData } from "@/components/graphWithForm/graphForm/util/useInteractiveData";

import { useRainGaugeData } from "@/util/useRainGaugeData";
import { useAdjustableDateRange } from "@/util/useAdjustableDateRange";
import { splitSubtotalIntoCoords } from "@/util/splitIntoCoords";
import { getTimeRangeGraphTitle } from "@/util/getGraphTitle";
import { getStatsForRainGaugePage } from "@/util/stats/getStatsForRainGaugePage";
import { StatsTable } from "@/components/statsTable/StatsTable";

export default function Home() {
  const rainData = useRainGaugeData();
  const dataInDateRange = useAdjustableDateRange(rainData);

  const formKit = useInteractiveData({
    updateDateRange: dataInDateRange.updateDateRange,
    minDate: dataInDateRange.minDate,
    maxDate: dataInDateRange.maxDate,
  });

  const graphCoords = splitSubtotalIntoCoords(dataInDateRange.subtotals);
  const graphTitle = getTimeRangeGraphTitle(dataInDateRange?.subtotals[0]?.firstTimestamp, dataInDateRange?.subtotals[dataInDateRange.subtotals.length - 1]?.lastTimestamp);
  
  const recordsPerHour = rainData.data === undefined ? 0 : parseInt(rainData.data.recordsPerHour);
  const stats = getStatsForRainGaugePage(dataInDateRange.subtotals, recordsPerHour);

  return (
      <main>
        <div className="container mt-4"> 
          <PageHeader 
            locationName = { rainData.locationName }
          />

          <div className="row mt-5"> 
            <GraphWithForm 
              title = { graphTitle }
              xCoords = { graphCoords.xCoords }
              yCoords = { graphCoords.yCoords }
              formKit = { formKit }
            />
          </div>

          <div className="row mt-5">
            <StatsCards 
              statsData = { stats.statsCards }
            />
          </div>
  
          <div className="row mt-5">

            <StatsTable
              tableData = { stats.wettestDriestTable }
            />
            <MapPanel
              data = { rainData }
            />

          </div>
        </div>
      </main>
    )
}