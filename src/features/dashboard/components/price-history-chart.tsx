"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import { ISO_FORMAT } from "../utils/date-parse";
import { cyan, grey, orange } from "@mui/material/colors";
import { useTheme } from "@mui/material";
import { useClientOnly } from "@/hooks/use-client-only";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type PricePoint = { date: string; price: number };
export type KeyEvent   = { date: Date; price?: number; type: string };

interface Props {
  priceHistory: PricePoint[];
  keyEvents?: KeyEvent[];
  colors?: Record<string, string>;
}

/* Minimal shape needed for Apex point annotations */
interface PointAnnotation {
  x: number | string;
  y: number;
  marker?: { size?: number; fillColor?: string; strokeColor?: string };
  label?: {
    text?: string;
    borderColor?: string;
    style?: { fontSize?: string; background?: string; color?: string };
  };
}

const CHART_HEIGHT = 400;

export default function PriceHistoryChart({
  priceHistory,
  keyEvents = [],
  colors = {},
}: Props) {
  const theme = useTheme();
  const isClient = useClientOnly();

  /* Build chart data & annotations exactly once per prop‑change */
  const { series, annotations } = useMemo(() => {
    if (!priceHistory.length) return { series: [], annotations: [] as PointAnnotation[] };

    const dates = priceHistory.map(({ date }) => new Date(date));
    const prices = priceHistory.map(({ price }) => (price === 0 ? null : price));

    const isoIndex = new Map(
      dates.map((d, i) => [dayjs(d).format(ISO_FORMAT), i])
    );

    const priceSeries = {
      name: "Price",
      data: dates.reduce<[number, number][]>((pts, d, i) => {
        const y = prices[i];
        if (y != null) pts.push([d.getTime(), y]);
        return pts;
      }, []),
      color: orange[300],
    };

    const points: PointAnnotation[] = [];
    keyEvents.forEach(({ date, price, type }) => {
      const iso = dayjs(date).format(ISO_FORMAT);
      const idx = isoIndex.get(iso);
      const y = price ?? (idx !== undefined ? prices[idx] : null);
      if (y == null) return;

      const color = colors[type] ?? cyan[300];
      points.push({
        x: new Date(date).getTime(),
        y,
        marker: { size: 6, fillColor: color, strokeColor: theme.palette.background.paper },
        label: {
          text: type,
          borderColor: color,
          style: {
            fontSize: "12px",
            background: theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
          },
        },
      });
    });

    return { series: [priceSeries], annotations: points };
  }, [priceHistory, keyEvents, colors, theme.palette.mode]);

  if (!series.length) return <p>No price history available</p>;
  if (!isClient) return null;

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: CHART_HEIGHT,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    theme: { mode: theme.palette.mode as "light" | "dark" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: { labels: { formatter: (v) => (v != null ? v.toFixed(2) : "") } },
    tooltip: {
      x: { format: "dd MMM yyyy" },
      y: { formatter: (v) => (v != null ? v.toFixed(2) : "—") },
    },
    legend: { position: "top", horizontalAlign: "left" },
    annotations: { points: annotations },
    colors: series.map((s: any) => s.color),
  };

  return <Chart options={options} series={series} type="area" height={CHART_HEIGHT} />;
}
