"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { BarChart } from "@mantine/charts";
import { Group, NumberInput, Skeleton, Stack, Text } from "@mantine/core";
import { DengueCasesAPI } from "@/libraries/api/DengueAPI";
import { TransformMonthlyDengueCasesToBarChart } from "@/libraries/serializer/TransformMonthlyDengueCasesBarChart";

type MonthlyCasesBarChartProps = {
  psgcCode: string | null | undefined;
  defaultYear?: number;
  title?: string;
};

export default function MonthlyCasesBarChart({
  psgcCode,
  defaultYear,
  title = "Monthly Dengue Cases",
}: MonthlyCasesBarChartProps) {
  const [year, setYear] = useState<number>(
    defaultYear ?? new Date().getFullYear(),
  );

  const swrKey = psgcCode ? ["monthly-dengue-cases", psgcCode, year] : null;

  const {
    data: apiData,
    isLoading,
    error,
  } = useSWR(swrKey, () => DengueCasesAPI.getMonthlyCases(psgcCode!, year));

  const chartData = useMemo(
    () =>
      TransformMonthlyDengueCasesToBarChart(apiData, {
        fillMissingMonths: true,
      }),
    [apiData],
  );

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end">
        <Text fw={600} size="lg">
          {title}
        </Text>

        <NumberInput
          label="Year"
          value={year}
          onChange={(value) =>
            setYear(
              typeof value === "number" ? value : new Date().getFullYear(),
            )
          }
          min={2000}
          max={2100}
          clampBehavior="strict"
          w={140}
        />
      </Group>

      {!psgcCode ? (
        <Text c="dimmed" size="sm">
          Select a barangay to view monthly cases
        </Text>
      ) : isLoading ? (
        <Skeleton height={350} radius="md" />
      ) : error ? (
        <Text c="red.6" size="sm">
          Failed to load monthly dengue cases
        </Text>
      ) : chartData.length === 0 ? (
        <Text c="dimmed" size="sm">
          No monthly case data available for {year}
        </Text>
      ) : (
        <BarChart
          h={350}
          data={chartData}
          dataKey="month"
          series={[{ name: "caseCount", color: "blue.6", label: "Cases" }]}
          barProps={{ radius: [10, 10, 0, 0] }}
          withLegend
          withTooltip
          xAxisLabel="Month"
          yAxisLabel="Cases"
          tooltipAnimationDuration={200}
          gridAxis="xy"
        />
      )}
    </Stack>
  );
}
