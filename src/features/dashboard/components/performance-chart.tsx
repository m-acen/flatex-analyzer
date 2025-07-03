"use client";

import { useTheme } from "@mui/material";
import Chart from "react-apexcharts";
import { useShowValues } from "../hooks/use-show-values";
import { ProgressState } from "../hooks/use-assets-calc";
import {
  getAccumulatedCashFlows,
  getAccumulatedDepotValue,
  getAccumulatedCashPosition,
  getCombinedNetWorth,
} from "../logic/analyze";
import { ParsedAccountTransaction } from "../types/account-transaction";
import { Asset } from "../types/asset";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import {
  blue,
  cyan,
  green,
  grey,
  orange,
  red,
  yellow,
} from "@mui/material/colors";
import { useClientOnly } from "@/hooks/use-client-only";

function extendSeriesToEnd(
  series: { date: Date; value: number | null }[],
  endDate: Date
) {
  if (series.length === 0) return [];

  const lastValue = series[series.length - 1].value;
  const extended = [...series];

  const lastTimestamp = new Date(series[series.length - 1].date).getTime();
  const endTimestamp = endDate.getTime();

  if (lastTimestamp < endTimestamp && lastValue != null) {
    extended.push({ date: new Date(endDate), value: lastValue });
  }

  return extended;
}

enum SeriesIds {
  CASH_FLOWS = "cashFlows",
  NET_WORTH = "netWorth",
  CASH_POSITION = "cashPosition",
  DEPOT_VALUE = "depotValue",
}

export default function PerformanceChart({
  accountTransactions,
  sortedItems,
  progress,
}: {
  accountTransactions: ParsedAccountTransaction[];
  sortedItems: Asset[];
  progress: ProgressState;
}) {
  const theme = useTheme();
  const { showValues } = useShowValues();

  const isClient = useClientOnly();

  const firstTransactionDate = accountTransactions[0]?.Buchtag;

  const cashFlows = getAccumulatedCashFlows(accountTransactions);

  const accumulatedDepotValue =
    progress === ProgressState.COMPLETED
      ? getAccumulatedDepotValue(sortedItems, firstTransactionDate, new Date())
      : [];

  const accumulatedCashPosition =
    getAccumulatedCashPosition(accountTransactions);

  const accumulatedNetWorth =
    progress === ProgressState.COMPLETED
      ? getCombinedNetWorth(accumulatedCashPosition, accumulatedDepotValue)
      : [];

  /** helper – convert {date,value}[] to Apex xy tuple format */
  const toSeriesData = (arr: { date: Date; value: number | null }[]) =>
    extendSeriesToEnd(arr, new Date()).map(
      (d) => [new Date(d.date).getTime(), d.value] as [number, number | null]
    );

  /** full list of series including styling */
  const lineSeries = useMemo(
    () => [
      {
        id: SeriesIds.CASH_FLOWS,
        name: "Investments",
        data: toSeriesData(cashFlows),
        color: blue[500],
        hidden: false,
      },
      {
        id: SeriesIds.NET_WORTH,
        name: "Net Worth",
        data: toSeriesData(accumulatedNetWorth),
        color: green[300],
        hidden: false,
      },
      {
        id: SeriesIds.CASH_POSITION,
        name: "Cash Position",
        data: toSeriesData(accumulatedCashPosition),
        color: grey[500],
        hidden: true,
      },
      {
        id: SeriesIds.DEPOT_VALUE,
        name: "Depot Value",
        data: toSeriesData(accumulatedDepotValue),
        color: cyan[300],
        hidden: true,
      },
    ],
    [
      cashFlows,
      accumulatedNetWorth,
      accumulatedCashPosition,
      accumulatedDepotValue,
      theme.palette,
    ]
  );

  const apexSeries: ApexAxisChartSeries = useMemo(
    () => lineSeries.map(({ name, data, hidden }) => ({ name, data, hidden })),
    [lineSeries]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "performance-chart",
        toolbar: { show: false },
        animations: { enabled: false },
        background: "transparent",
      },
      theme: {
        mode: theme.palette.mode as "light" | "dark",
      },
      stroke: { curve: "smooth" },
      xaxis: {
        type: "datetime",
        tooltip: { enabled: false },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        labels: {
          formatter: (value: number | null) =>
            showValues && value != null ? value.toFixed(0) : "",
        },
      },
      colors: lineSeries.map((s) => s.color),
      tooltip: {
        x: { format: "dd MMM yyyy" },
        y: {
          formatter: (value: number | undefined) =>
            value != null ? value.toFixed(0) : "—",
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontSize: "14px",
        labels: {
          colors: theme.palette.text.primary,
        },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
    }),
    [showValues, lineSeries, theme.palette.mode, theme.palette.text.primary]
  );
  if (!isClient) return null;
  return (
    <Chart options={options} series={apexSeries} type="area" height={350} />
  );
}
