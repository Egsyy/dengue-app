import { PredictedDengueCase } from "@/models/PredictedDengueCase";
import {
  DengueRiskAssessment,
  RiskAssessmentResult,
} from "./DengueRiskAssessment";

/**
 * Integration utilities for connecting risk assessment with API data
 */

/**
 * Fetch dengue prediction data and assess risk
 */
export async function fetchAndAssessRisk(
  psgccode: string,
  selectedDate: string,
  historicalAverage?: number
): Promise<RiskAssessmentResult | null> {
  try {
    // Import the API function dynamically to avoid circular dependencies
    const { DengueCasesAPI } = await import("@/libraries/api/DengueAPI");

    // Fetch the prediction data - API returns Promise<DengueCase>
    const dengueCase: PredictedDengueCase =
      await DengueCasesAPI.getOneWeekPrediction(psgccode, selectedDate);

    // Assess the risk
    return DengueRiskAssessment.assessRisk(dengueCase, historicalAverage);
  } catch (error) {
    console.error("Error in fetchAndAssessRisk:", error);
    return null;
  }
}

/**
 * Calculate historical average for a given barangay
 */
export async function getHistoricalAverage(
  psgccode: string,
  years: number = 3
): Promise<number | null> {
  try {
    // This would typically fetch historical data from your API
    // For now, returning a placeholder value
    // In a real implementation, you would:
    // 1. Fetch historical dengue cases for the specified years
    // 2. Calculate the average prediction value
    // 3. Return the average for risk assessment adjustment

    // Placeholder implementation
    return 25; // Example historical average
  } catch (error) {
    console.error("Error calculating historical average:", error);
    return null;
  }
}

/**
 * Get risk assessment with historical context
 */
export async function getRiskAssessmentWithContext(
  psgccode: string,
  selectedDate: string
): Promise<RiskAssessmentResult | null> {
  try {
    // Get historical average for context
    const historicalAverage = await getHistoricalAverage(psgccode);

    // Fetch and assess risk with historical context
    return await fetchAndAssessRisk(
      psgccode,
      selectedDate,
      historicalAverage || undefined
    );
  } catch (error) {
    console.error("Error in getRiskAssessmentWithContext:", error);
    return null;
  }
}

/**
 * Batch risk assessment for multiple barangays
 */
export async function batchRiskAssessment(
  barangayData: Array<{ psgccode: string; selectedDate: string }>
): Promise<Array<{ psgccode: string; result: RiskAssessmentResult | null }>> {
  const results = await Promise.allSettled(
    barangayData.map(async ({ psgccode, selectedDate }) => {
      const result = await fetchAndAssessRisk(psgccode, selectedDate);
      return { psgccode, result };
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(
        `Failed to assess risk for ${barangayData[index].psgccode}:`,
        result.reason
      );
      return { psgccode: barangayData[index].psgccode, result: null };
    }
  });
}

/**
 * Get risk trend over time for a specific barangay
 */
export async function getRiskTrend(
  psgccode: string,
  startDate: string,
  endDate: string,
  weekInterval: number = 1
): Promise<
  Array<{
    date: string;
    riskLevel: string;
    trend: "improving" | "stable" | "worsening";
  }>
> {
  try {
    // This would typically fetch multiple weeks of data
    // For now, returning a placeholder implementation
    // In a real implementation, you would:
    // 1. Fetch prediction data for each week in the date range
    // 2. Calculate risk assessment for each week
    // 3. Determine the trend between consecutive weeks
    // 4. Return the trend data

    const trendData = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    let previousValue = 0;

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0];

      // Placeholder prediction value - in real implementation, fetch from API
      const predictionValue = Math.floor(Math.random() * 100);
      const riskResult =
        DengueRiskAssessment.quickRiskAssessment(predictionValue);

      const trend = DengueRiskAssessment.getRiskTrend(
        predictionValue,
        previousValue
      );

      trendData.push({
        date: dateString,
        riskLevel: riskResult.riskLevel,
        trend,
      });

      previousValue = predictionValue;
      currentDate.setDate(currentDate.getDate() + 7 * weekInterval);
    }

    return trendData;
  } catch (error) {
    console.error("Error in getRiskTrend:", error);
    return [];
  }
}

/**
 * Risk assessment cache utilities
 */
class RiskAssessmentCache {
  private cache = new Map<
    string,
    { result: RiskAssessmentResult; timestamp: number }
  >();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(psgccode: string, selectedDate: string): string {
    return `${psgccode}-${selectedDate}`;
  }

  get(psgccode: string, selectedDate: string): RiskAssessmentResult | null {
    const key = this.getCacheKey(psgccode, selectedDate);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  set(
    psgccode: string,
    selectedDate: string,
    result: RiskAssessmentResult
  ): void {
    const key = this.getCacheKey(psgccode, selectedDate);
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const riskAssessmentCache = new RiskAssessmentCache();

/**
 * Cached version of fetchAndAssessRisk
 */
export async function fetchAndAssessRiskCached(
  psgccode: string,
  selectedDate: string,
  historicalAverage?: number
): Promise<RiskAssessmentResult | null> {
  // Check cache first
  const cached = riskAssessmentCache.get(psgccode, selectedDate);
  if (cached) {
    return cached;
  }

  // Fetch and assess if not in cache
  const result = await fetchAndAssessRisk(
    psgccode,
    selectedDate,
    historicalAverage
  );

  if (result) {
    riskAssessmentCache.set(psgccode, selectedDate, result);
  }

  return result;
}
