"use client";

import { Box, Chip, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { useShowValues } from "../hooks/use-show-values";
import { ProgressState } from "../hooks/use-assets-calc";
import { getAccumulatedCashFlows, getAccumulatedDepotValue, getAccumulatedCashPosition } from "../logic/analyze";
import { ParsedAccountTransaction } from "../types/account-transaction";
import { Asset } from "../types/asset";
import { useState } from "react";

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
    const [activeSeries, setActiveSeries] = useState<string[]>(Object.values(SeriesIds));
    const theme = useTheme();
    const { showValues } = useShowValues();
    const firstTransactionDate = accountTransactions[0]?.Buchtag;

    const cashFlows = getAccumulatedCashFlows(
        firstTransactionDate,
        new Date(),
        accountTransactions
    );

    const accumulatedDepotValue =
        progress === ProgressState.COMPLETED
            ? getAccumulatedDepotValue(sortedItems, firstTransactionDate, new Date())
            : [];

    const accumulatedCashPosition = getAccumulatedCashPosition(
        firstTransactionDate,
        new Date(),
        accountTransactions
    );

    const accumulatedNetWorth =
        progress === ProgressState.COMPLETED
            ? accumulatedDepotValue.map((d, index) => ({
                date: d.date,
                value: d.value + accumulatedCashPosition[index].value,
            }))
            : [];

    const series = [
        {
            id: SeriesIds.CASH_FLOWS,
            data: cashFlows.map((d) => d.value),
            label: "Investments",
            showMark: false,
            color: theme.palette.secondary.main,
        },
        {
            id: SeriesIds.NET_WORTH,
            data: accumulatedNetWorth.map((d) => d.value),
            label: "Net Worth",
            showMark: false,
            connectNulls: true,
            color: theme.palette.primary.main,
        },
        {
            id: SeriesIds.CASH_POSITION,
            data: accumulatedCashPosition.map((d) => d.value),
            label: "Cash Position",
            showMark: false,
            connectNulls: true,
            color: theme.palette.grey[500],
        },
        {
            id: SeriesIds.DEPOT_VALUE,
            data: accumulatedDepotValue.map((d) => d.value),
            label: "Depot Value",
            showMark: false,
            connectNulls: true,
            color: theme.palette.success.main,
        },
    ];

    function handleSeriesClick(seriesId: string) {
        if (activeSeries.includes(seriesId)) {
            setActiveSeries(activeSeries.filter((id) => id !== seriesId));
        }
        else {
            setActiveSeries([...activeSeries, seriesId]);
        }
    }

    return <>
        <Box flexWrap={"wrap"} display="flex" flexDirection="row" gap={1} mb={2} alignItems="center">
            <Chip size="small" variant={activeSeries.find(s => s == SeriesIds.CASH_FLOWS) ? "filled" : "outlined"} color="secondary" label="Investments" onClick={() => handleSeriesClick(SeriesIds.CASH_FLOWS)} />
            <Chip size="small" variant={activeSeries.find(s => s == SeriesIds.NET_WORTH) ? "filled" : "outlined"} color="primary" label="Net Worth" onClick={() => handleSeriesClick(SeriesIds.NET_WORTH)} />
            <Chip size="small" variant={activeSeries.find(s => s == SeriesIds.CASH_POSITION) ? "filled" : "outlined"} sx={{ color: theme.palette.grey[500] }} label="Cash Position" onClick={() => handleSeriesClick(SeriesIds.CASH_POSITION)} />
            <Chip size="small" variant={activeSeries.find(s => s == SeriesIds.DEPOT_VALUE) ? "filled" : "outlined"} color="success" label="Depot Value" onClick={() => handleSeriesClick(SeriesIds.DEPOT_VALUE)} />
        </Box>
        <LineChart
            yAxis={[
                {
                    valueFormatter: (value) => (showValues ? value : ""),
                },
            ]}
            sx={{
                height: "100%",
            }}
            xAxis={[
                {
                    data: cashFlows.map((d) => d.date),
                    scaleType: "time",
                    label: "Date",
                },
            ]}
            series={series.filter((s) => activeSeries.includes(s.id))
            }
        />
    </>
}