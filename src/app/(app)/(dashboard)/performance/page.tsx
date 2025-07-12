"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Box, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { green, blue, red, cyan, orange, purple } from "@mui/material/colors";

import { useDepot } from "@/features/dashboard/hooks/use-depot";
import { ProgressState } from "@/features/dashboard/hooks/use-assets-calc";
import {
  getAccumulatedDepotValue,
  getAccumulatedCashPosition,
  getCombinedNetWorth,
  DateValue,
  getAccumulatedCashFlows,
} from "@/features/dashboard/logic/analyze";
import { usePriceHistory } from "@/features/dashboard/hooks/use-price-history";
import { ISO_FORMAT } from "@/features/dashboard/utils/date-parse";
import { getLatestDateValue } from "@/features/dashboard/utils/date-values";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Define external tickers to include
const tickers = [
  { name: "S&P 500", ticker: "^GSPC" },
  { name: "NASDAQ", ticker: "NDX" },
  { name: "MSCI World", ticker: "EUNL.DE" },
];

function getNormalizedDateValues(values: DateValue[]): DateValue[] {
  if (values.length === 0) return [];

  const base = values[0].value;

  return values.map((entry, index) => ({
    date: entry.date,
    value: index === 0 || base === 0 ? 0 : (entry.value - base) / base,
  }));
}

function getRelativeProfit(
  networthValues: DateValue[],
  investmentValues: DateValue[]
): DateValue[] {
  const result: DateValue[] = [];
  for (let i = 0; i < networthValues.length; i++) {
    const investmentValue = getLatestDateValue(
      investmentValues,
      networthValues[i].date
    );
    result.push({
      date: networthValues[i].date,
      value:
        (networthValues[i].value - investmentValue.value) /
        investmentValue.value,
    });
  }
  return result;
}

function getEntryToEntryRelativeDeltas(values: DateValue[]): DateValue[] {
  if (values.length < 2) return [];

  const result: DateValue[] = [];

  let previous = values[0];
  for (let i = 1; i < values.length; i++) {
    const current = values[i];
    if (previous.value === 0) {
      previous = current;
      continue;
    }

    const delta = (current.value - previous.value) / previous.value;
    result.push({ date: current.date, value: delta });

    previous = current;
  }

  return result;
}

function getAccumulatedRelativeDeltaPerYear(
  deltas: DateValue[],
  average: boolean
): DateValue[] {
  const yearlyGroups = new Map<number, { deltas: number[]; lastDate: Date }>();

  for (const entry of deltas) {
    const year = entry.date.getFullYear();
    const group = yearlyGroups.get(year) ?? {
      deltas: [],
      lastDate: entry.date,
    };
    group.deltas.push(entry.value);
    group.lastDate = entry.date; // override to get last timestamp in year
    yearlyGroups.set(year, group);
  }

  return Array.from(yearlyGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, { deltas, lastDate }]) => ({
      date: lastDate,
      value:
        deltas.reduce((sum, d) => sum + d, 0) / (average ? deltas.length : 1),
    }));
}

function getAccumulatedYearlyRelativeDelta(
  values: DateValue[],
  average: boolean
): DateValue[] {
  if (values.length < 2) return [];

  const deltas = getEntryToEntryRelativeDeltas(values);
  return getAccumulatedRelativeDeltaPerYear(deltas, average);
}

// Convert to ApexChart format
function toApexSeriesData(arr: DateValue[]): [number, number | null][] {
  return arr.map((d) => [d.date.getTime(), d.value] as [number, number | null]);
}

export default function PerformancePage() {
  const { assets, accountTransactions, progress } = useDepot();
  const theme = useTheme();

  const firstTransactionDate = accountTransactions[0]?.Buchtag;

  const { data: priceData, isLoading } = usePriceHistory({
    start: dayjs(firstTransactionDate).format(ISO_FORMAT),
    end: dayjs().format(ISO_FORMAT),
    tickers: tickers.map((t) => t.ticker),
  });
calculatePortfolioIndex
  const investments = getAccumulatedCashFlows(accountTransactions);

  const accumulatedDepotValue =
    progress.state === ProgressState.COMPLETED
      ? getAccumulatedDepotValue(assets, firstTransactionDate, new Date())
      : [];

  const accumulatedCashPosition =
    getAccumulatedCashPosition(accountTransactions);

  const accumulatedNetWorth: DateValue[] =
    progress.state === ProgressState.COMPLETED
      ? getCombinedNetWorth(accumulatedCashPosition, accumulatedDepotValue)
      : [];
  const diff = getRelativeProfit(accumulatedNetWorth, investments);
  const networthSeries = useMemo(
    () => toApexSeriesData(diff), //
    [diff]
  );

  const benchmarkSeries = useMemo(() => {
    if (!priceData?.dates || !priceData.prices) return [];

    return tickers.map(({ name, ticker }) => {
      const priceValues: DateValue[] = priceData.dates
        .map((dateStr, idx) => ({
          date: new Date(dateStr),
          value: priceData.prices[ticker]?.[idx] ?? null,
        }))
        .filter((d) => d.value !== null) as DateValue[];

      return {
        name,
        data: toApexSeriesData(getNormalizedDateValues(priceValues)),
      };
    });
  }, [priceData, isLoading]);

  const options: ApexOptions = {
    chart: {
      id: "relative-performance-chart",
      background: "transparent",
      toolbar: { show: true },
      animations: { enabled: false },
    },
    theme: {
      mode: theme.palette.mode as "light" | "dark",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      labels: {
        formatter: (value: number) => (value * 100).toFixed(1) + "%",
      },
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (value: number) => (value * 100).toFixed(2) + "%",
      },
    },
    stroke: {
      curve: "smooth",
    },
    dataLabels: {
      enabled: false,
    },
    colors: [
      green[400],
      blue[400],
      red[400],
      cyan[400],
      orange[400],
      purple[400],
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
  };

  return (
    <Box sx={{ width: "100%", height: "100%", p: 8 }}>
      {progress.state === ProgressState.COMPLETED && (
        <Chart
          options={options}
          series={[
            { name: "Your Performance", data: networthSeries },
            ...benchmarkSeries,
          ]}
          type="area"
          height={350}
          width="100%"
        />
      )}
    </Box>
  );
}
