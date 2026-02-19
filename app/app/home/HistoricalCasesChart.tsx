"use client";

import React, { useMemo } from "react";
import { BarChart } from "@mantine/charts";
import { Card, Title, Text, Paper, Stack } from "@mantine/core";
import { YearlyHistoricalDengueCases } from "@/models/HistoricalDengueCase";
import { TransformToYearlyCasesToChart } from "@/libraries/serializer/TransformYearlyHistoricalBarChart";
import { cn } from "@/libraries/ui/CnExtension";

interface HistoricalCasesChartProps {
  data: YearlyHistoricalDengueCases;
  height?: number;
  showTrend?: boolean;
  className?: string;
}

export const HistoricalCasesChart = ({
  data,
  height = 400,
  showTrend = true,
  className = "",
}: HistoricalCasesChartProps) => {
  const chartJs = TransformToYearlyCasesToChart(data);

  const mantineData = useMemo(() => {
    const labels = chartJs.labels ?? [];
    const values = (chartJs.datasets && chartJs.datasets[0]?.data) || [];

    return labels.map((lbl: any, idx: number) => ({
      year: lbl,
      "Dengue Cases": values[idx] ?? 0,
    }));
  }, [chartJs]);

  const series = useMemo(() => {
    return [
      {
        name: "Dengue Cases",
        color: "blue.6",
        label: "Reported Dengue Cases",
      },
    ];
  }, []);

  return (
    <Card shadow="md" padding="lg" radius="md" withBorder className={className}>
      <Stack gap="md">
        <Title order={4}>Historical Dengue Cases</Title>

        <BarChart
          h={height}
          data={mantineData}
          dataKey="year"
          series={series}
          withLegend={false}
          withTooltip
          xAxisLabel="Year"
          yAxisLabel="Cases"
          tooltipAnimationDuration={200}
          gridAxis="xy"
          barProps={{ radius: [12, 12, 0, 0] }}
          withBarValueLabel
        />

        {showTrend && (
          <Paper p="sm" bg="gray.1" radius="md">
            <Text size="sm">
              <Text component="span" fw={600}>
                Trend Analysis:
              </Text>
              {data.recorded_cases.length > 1 && (
                <>
                  {" "}
                  {data.recorded_cases[data.recorded_cases.length - 1]
                    .total_cases >
                  data.recorded_cases[data.recorded_cases.length - 2]
                    .total_cases
                    ? "↑ Increasing"
                    : "↓ Decreasing"}
                  {" trend compared to previous year"}
                </>
              )}
            </Text>
          </Paper>
        )}
      </Stack>
    </Card>
  );
};

export default HistoricalCasesChart;
