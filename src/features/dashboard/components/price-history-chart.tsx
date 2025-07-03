"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { ISO_FORMAT } from "../utils/date-parse";
import { cyan, grey } from "@mui/material/colors";
import { useTheme } from "@mui/material";
import { useClientOnly } from "@/hooks/use-client-only";

type PricePoint = {
  date: string;
  price: number;
};

type KeyEvent = {
  date: Date;
  price?: number;
  type: string;
};

type Props = {
  priceHistory: PricePoint[];
  keyEvents?: KeyEvent[];
  title?: string;
  colors?: { [key: string]: string };
};

export default function PriceHistoryChart({
  priceHistory,
  keyEvents = [],
  colors = {},
}: Props) {
  const theme = useTheme();

  const isClient = useClientOnly();

  if (!priceHistory.length) return <p>No price history available</p>;

  const dates = priceHistory.map((p) => new Date(p.date));
  const prices = priceHistory.map((p) => (p.price === 0 ? null : p.price));

  const dateIndexMap = useMemo(() => {
    return new Map(dates.map((d, i) => [dayjs(d).format(ISO_FORMAT), i]));
  }, [dates]);

  const baseSeries = {
    name: "Price",
    data: priceHistory.map((p) => [
      new Date(p.date).getTime(),
      p.price === 0 ? null : p.price,
    ]) as [number, number | null][],
    color: grey[700],
  };

  const uniqueEventTypes = Array.from(new Set(keyEvents.map((e) => e.type)));

  const eventSeries = uniqueEventTypes.map((type) => {
    const points: [number, number | null][] = dates.map(() => [0, null]);

    keyEvents
      .filter((e) => e.type === type)
      .forEach((e) => {
        const isoDate = dayjs(e.date).format(ISO_FORMAT);
        const index = dateIndexMap.get(isoDate);
        if (index !== undefined) {
          const price = e.price ?? prices[index];
          if (price != null) {
            points[index] = [dates[index].getTime(), price];
          }
        } else {
          console.warn(`Date ${isoDate} not found in price history`, e);
        }
      });

    const filtered = points.filter(([x, y]) => y !== null);

    return {
      name: type,
      data: filtered,
      color: colors[type] || cyan[300],
    };
  });

  const apexSeries = [baseSeries, ...eventSeries];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 400,
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: false },
    },
    dataLabels: {
      enabledOnSeries: apexSeries.map((s, i) => {
        if (i !== 0) {
          return i;
        }
      }), // Only show on the first series (price)
    },

    theme: {
      mode: theme.palette.mode as "light" | "dark",
    },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value != null ? value.toFixed(2) : ""),
      },
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (value) => (value != null ? value.toFixed(2) : "—"),
      },
    },
    colors: apexSeries.map((s) => (s as any).color),
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };
  if (!isClient) return null;
  return (
    <Chart options={options} series={apexSeries} type="area" height={400} />
  );
}
