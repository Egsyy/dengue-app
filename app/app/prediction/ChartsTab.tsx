"use client";

import React, { useEffect, useMemo } from "react";
import { BarChart, ScatterChart } from "@mantine/charts";
import { ProbabilitySampleData } from "@/data/DengueProbability";
import useSWR from "swr";
import { DengueCasesAPI } from "@/libraries/api/DengueAPI";
import { useBarangaySelectionStore } from "@/libraries/stores/useBarangaySelectionStore";
import { useCalendarContext } from "@/libraries/contexts/CalendarContext";
import { TransformLast5YearsToScatterChart } from "@/libraries/serializer/TransformLast5YearsScatterChart";
import { MonthlyAverageResponse, MonthlyAverageOutbreakProbabilityResponse } from "@/models/Statistics";
import { Skeleton, Text, Stack, Paper, Alert } from "@mantine/core";
import MonthlyCasesBarChart from "./MonthlyCasesBarChart";

type Props = {};

const ChartsTab = (props: Props) => {
  const { SelectedBarangay } = useBarangaySelectionStore();
  const { isoYear } = useCalendarContext();

  const { data, mutate, isLoading } = useSWR(
    SelectedBarangay !== null ? "fetch-weekly-predicted-data" : null,
    () =>
      DengueCasesAPI.getWeeklyPredictionWithParams(SelectedBarangay?.PsgcCode!),
  );

  // Fetch monthly average data
  const { data: monthlyAverageData, isLoading: isMonthlyAverageLoading } = useSWR<
    MonthlyAverageResponse,
    any
  >(
    SelectedBarangay !== null && isoYear
      ? `monthly-average-${SelectedBarangay.PsgcCode}-${isoYear}`
      : null,
    () =>
      DengueCasesAPI.getMonthlyAverage(
        SelectedBarangay!.PsgcCode,
        isoYear!
      ),
  );

  // Fetch monthly average outbreak probability data
  const { data: monthlyAverageOutbreakProbabilityData, isLoading: isMonthlyAverageOutbreakProbabilityLoading } = useSWR<
    MonthlyAverageOutbreakProbabilityResponse,
    any
  >(
    SelectedBarangay !== null && isoYear
      ? `monthly-average-outbreak-probability-${SelectedBarangay.PsgcCode}-${isoYear}`
      : null,
    () =>
      DengueCasesAPI.getMonthlyAverageOutbreakProbability(
        SelectedBarangay!.PsgcCode,
        isoYear!
      ),
  );

  // Fetch last 5 years predictions for ScatterChart
  const {
    data: last5YearsData,
    mutate: mutateLast5Years,
    isLoading: isLoadingLast5Years,
    error: last5YearsError,
  } = useSWR(
    SelectedBarangay !== null
      ? `fetch-last-5-years-predictions-${SelectedBarangay.PsgcCode}`
      : null,
    () => DengueCasesAPI.getLast5YearsPredictions(SelectedBarangay?.PsgcCode!),
  );

  // Transform API data to ScatterChart format using memoization for performance
  const scatterChartData = useMemo(() => {
    if (!last5YearsData) {
      return [];
    }
    // Pass the full response to the transformer - it handles the nested structure
    return TransformLast5YearsToScatterChart(last5YearsData);
  }, [last5YearsData]);

  // Handle 404 error separately

  // Update riskResult when data changes
  useEffect(() => {
    if (data) {
    }
  }, [data]);

  // Reset when barangay changes
  useEffect(() => {
    mutate();
    mutateLast5Years();
  }, [SelectedBarangay]);

  // Debug: log raw API response and transformed data
  console.info("Raw API Response:", last5YearsData);
  console.info("Transformed ScatterChart Data:", scatterChartData);
  console.info("Monthly Average Data:", monthlyAverageData);
  console.info("Monthly Average Outbreak Probability Data:", monthlyAverageOutbreakProbabilityData);
  return (
    <Stack gap="xl">
      {/* Last 5 Years Outbreak Probability ScatterChart */}
      <Stack gap="sm">
        <Text fw={600} size="lg">
          5-Year Outbreak Probability Trend
        </Text>
        {isLoadingLast5Years ? (
          <Skeleton height={350} radius="md" />
        ) : last5YearsError ? (
          <Text c="red.6" size="sm">
            Failed to load 5-year prediction data
          </Text>
        ) : scatterChartData.length > 0 ? (
          <ScatterChart
            h={350}
            data={scatterChartData}
            dataKey={{ x: "iso_week", y: "outbreak_probability" }}
            xAxisLabel="Week"
            yAxisLabel="Outbreak Probability (%)"
            withLegend
            legendProps={{ verticalAlign: "bottom", height: 40 }}
            withTooltip
            tooltipAnimationDuration={200}
            labels={{ x: "Week", y: "Probability" }}
            unit={{ y: "%" }}
            gridAxis="xy"
          />
        ) : (
          <Text c="dimmed" size="sm">
            Select a barangay to view 5-year predictions
          </Text>
        )}
        <Alert variant="light" color="blue" title="Chart Disclaimer">
          This chart shows the outbreak probability trends over the last 5 years. 
          Higher probabilities indicate increased risk of dengue outbreaks. 
          Use this information to understand seasonal patterns and prepare accordingly.
        </Alert>
      </Stack>

      {/* Monthly Average Predicted Dengue Cases Bar Chart */}
      <Stack gap="sm">
        <Text fw={600} size="lg">
          Monthly Average Predicted Dengue Cases - {isoYear}
        </Text>
        {isMonthlyAverageLoading ? (
          <Skeleton height={350} radius="md" />
        ) : monthlyAverageData && monthlyAverageData.monthlyData && monthlyAverageData.monthlyData.length > 0 ? (
          <>
            <BarChart
              h={350}
              data={monthlyAverageData.monthlyData.map(item => ({
                month: item.monthName,
                cases: item.averagePredictedCases
              }))}
              dataKey="month"
              series={[{ name: "cases", color: "blue.6" }]}
              xAxisProps={{ angle: -45, textAnchor: "end" }}
              withLegend
              withTooltip
              tooltipAnimationDuration={200}
              gridAxis="y"
            />
            <Alert variant="light" color="teal" title="Chart Disclaimer">
              This chart displays the average predicted dengue cases per month for {isoYear}. 
              It helps identify which months typically have higher dengue transmission, 
              allowing for targeted prevention efforts during peak seasons.
            </Alert>
          </>
        ) : (
          <Text c="dimmed" size="sm">
            Select a barangay to view monthly average predictions
          </Text>
        )}
      </Stack>

      {/* Monthly Average Outbreak Probability Bar Chart */}
      <Stack gap="sm">
        <Text fw={600} size="lg">
          Monthly Average Outbreak Probability - {isoYear}
        </Text>
        {isMonthlyAverageOutbreakProbabilityLoading ? (
          <Skeleton height={350} radius="md" />
        ) : monthlyAverageOutbreakProbabilityData && monthlyAverageOutbreakProbabilityData.monthlyData && monthlyAverageOutbreakProbabilityData.monthlyData.length > 0 ? (
          <>
            <BarChart
              h={350}
              data={monthlyAverageOutbreakProbabilityData.monthlyData.map(item => ({
                month: item.monthName,
                probability: item.averageOutbreakProbability
              }))}
              dataKey="month"
              series={[{ name: "probability", color: "red.6" }]}
              xAxisProps={{ angle: -45, textAnchor: "end" }}
              withLegend
              withTooltip
              tooltipAnimationDuration={200}
              gridAxis="y"
            />
            <Alert variant="light" color="orange" title="Chart Disclaimer">
              This chart displays the average outbreak probability per month for {isoYear}.
              It helps identify which months typically have higher risk of dengue outbreaks,
              allowing for targeted prevention efforts during high-risk seasons.
            </Alert>
          </>
        ) : (
          <Text c="dimmed" size="sm">
            Select a barangay to view monthly average outbreak probability
          </Text>
        )}
      </Stack>

      {/* Monthly Dengue Cases (Mantine BarChart) */}
      <MonthlyCasesBarChart psgcCode={SelectedBarangay?.PsgcCode} />
    </Stack>
  );
};

export default ChartsTab;
