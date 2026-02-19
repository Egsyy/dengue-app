import {
  Last5YearsPredictedResponse,
  YearlyPredictions,
} from "@/models/Last5YearsPredictedResponse";

/**
 * Mantine ScatterChart series data structure for 5-year predictions
 * Each series represents a year with its own color and data points
 */
export interface ScatterChartSeriesData {
  color: string;
  name: string;
  data: Array<{
    iso_week: number;
    outbreak_probability: number;
  }>;
}

// Mantine color palette for 5 years - using distinct, visually appealing colors
const YEAR_COLORS: Record<number, string> = {
  0: "blue.5",
  1: "teal.5",
  2: "violet.5",
  3: "orange.5",
  4: "pink.5",
};

/**
 * Transforms API response data into Mantine ScatterChart format.
 * Creates a series for each year from the nested values structure.
 *
 * @param response - The Last5YearsPredictedResponse from the API
 * @returns Array of ScatterChartSeriesData formatted for Mantine ScatterChart
 *
 * @example
 * // Input: { values: [{ isoYear: 2022, values: [...] }, ...] }
 * // Output: [{ color: 'blue.5', name: '2022', data: [{ iso_week: 1, outbreak_probability: 25.3 }, ...] }, ...]
 */
export function TransformLast5YearsToScatterChart(
  response: Last5YearsPredictedResponse,
): ScatterChartSeriesData[] {
  if (!response?.values || response.values.length === 0) {
    return [];
  }

  // Sort years in ascending order
  const sortedYearlyData = [...response.values].sort(
    (a, b) => a.isoYear - b.isoYear,
  );

  // Transform each year's data into a ScatterChart series
  return sortedYearlyData.map((yearData, index) => ({
    color: YEAR_COLORS[index % Object.keys(YEAR_COLORS).length],
    name: yearData.isoYear.toString(),
    data: yearData.values
      .map((prediction) => ({
        iso_week: prediction.predictedIsoWeek,
        outbreak_probability: Math.round(prediction.probabilityOfOutbreak), // Already in percentage, just round
      }))
      .sort((a, b) => a.iso_week - b.iso_week), // Sort by week for better visualization
  }));
}

/**
 * Transforms from the YearlyPredictions array directly
 * Use this if you already have the values array extracted
 */
export function TransformYearlyPredictionsToScatterChart(
  yearlyPredictions: YearlyPredictions[],
): ScatterChartSeriesData[] {
  if (!yearlyPredictions || yearlyPredictions.length === 0) {
    return [];
  }

  const sortedYearlyData = [...yearlyPredictions].sort(
    (a, b) => a.isoYear - b.isoYear,
  );

  return sortedYearlyData.map((yearData, index) => ({
    color: YEAR_COLORS[index % Object.keys(YEAR_COLORS).length],
    name: yearData.isoYear.toString(),
    data: yearData.values
      .map((prediction) => ({
        iso_week: prediction.predictedIsoWeek,
        outbreak_probability: Math.round(prediction.probabilityOfOutbreak),
      }))
      .sort((a, b) => a.iso_week - b.iso_week),
  }));
}
