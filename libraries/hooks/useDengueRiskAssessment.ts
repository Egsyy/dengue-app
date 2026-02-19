import { useState, useEffect, useCallback } from "react";
import { PredictedDengueCase } from "@/models/PredictedDengueCase";
import {
  RiskAssessmentResult,
  DengueRiskAssessment,
  RiskLevel,
} from "@/libraries/risk-assessment/DengueRiskAssessment";
import {
  fetchAndAssessRiskCached,
  getRiskAssessmentWithContext,
  getRiskTrend,
} from "@/libraries/risk-assessment/RiskAssessmentIntegration";

/**
 * Hook options for dengue risk assessment
 */
export interface UseDengueRiskAssessmentOptions {
  psgccode?: string;
  selectedDate?: string;
  enableCache?: boolean;
  includeHistoricalContext?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Hook return value
 */
export interface UseDengueRiskAssessmentReturn {
  riskResult: RiskAssessmentResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  riskTrend: Array<{
    date: string;
    riskLevel: string;
    trend: "improving" | "stable" | "worsening";
  }> | null;
  isTrendLoading: boolean;
  fetchRiskTrend: (startDate: string, endDate: string) => Promise<void>;
  quickAssess: (predictionValue: number) => RiskAssessmentResult;
}

/**
 * React hook for dengue risk assessment
 */
export function useDengueRiskAssessment(
  options: UseDengueRiskAssessmentOptions = {}
): UseDengueRiskAssessmentReturn {
  const {
    psgccode,
    selectedDate,
    enableCache = true,
    includeHistoricalContext = false,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [riskResult, setRiskResult] = useState<RiskAssessmentResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [riskTrend, setRiskTrend] =
    useState<UseDengueRiskAssessmentReturn["riskTrend"]>(null);
  const [isTrendLoading, setIsTrendLoading] = useState<boolean>(false);

  // Fetch risk assessment
  const fetchRiskAssessment = useCallback(async () => {
    if (!psgccode || !selectedDate) {
      setError("PSGC code and selected date are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: RiskAssessmentResult | null;

      if (includeHistoricalContext) {
        result = await getRiskAssessmentWithContext(psgccode, selectedDate);
      } else {
        result = enableCache
          ? await fetchAndAssessRiskCached(psgccode, selectedDate)
          : await fetchAndAssessRiskCached(psgccode, selectedDate);
      }

      if (result) {
        setRiskResult(result);
      } else {
        setError("Failed to fetch risk assessment data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching risk assessment:", err);
    } finally {
      setIsLoading(false);
    }
  }, [psgccode, selectedDate, enableCache, includeHistoricalContext]);

  // Fetch risk trend
  const fetchRiskTrendData = useCallback(
    async (startDate: string, endDate: string) => {
      if (!psgccode) {
        setError("PSGC code is required for trend analysis");
        return;
      }

      setIsTrendLoading(true);
      setError(null);

      try {
        const trendData = await getRiskTrend(psgccode, startDate, endDate);
        setRiskTrend(trendData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching risk trend:", err);
      } finally {
        setIsTrendLoading(false);
      }
    },
    [psgccode]
  );

  // Quick assessment function
  const quickAssess = useCallback(
    (predictionValue: number): RiskAssessmentResult => {
      return DengueRiskAssessment.quickRiskAssessment(predictionValue);
    },
    []
  );

  // Manual refetch
  const refetch = useCallback(async () => {
    await fetchRiskAssessment();
  }, [fetchRiskAssessment]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && psgccode && selectedDate) {
      const interval = setInterval(() => {
        fetchRiskAssessment();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [
    autoRefresh,
    psgccode,
    selectedDate,
    refreshInterval,
    fetchRiskAssessment,
  ]);

  // Initial fetch effect
  useEffect(() => {
    if (psgccode && selectedDate) {
      fetchRiskAssessment();
    }
  }, [psgccode, selectedDate, fetchRiskAssessment]);

  return {
    riskResult,
    isLoading,
    error,
    refetch,
    riskTrend,
    isTrendLoading,
    fetchRiskTrend: fetchRiskTrendData,
    quickAssess,
  };
}

/**
 * Hook for batch risk assessment across multiple barangays
 */
export function useBatchRiskAssessment() {
  const [results, setResults] = useState<
    Array<{ psgccode: string; result: RiskAssessmentResult | null }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const assessMultiple = useCallback(
    async (barangayData: Array<{ psgccode: string; selectedDate: string }>) => {
      setIsLoading(true);
      setError(null);

      try {
        const { batchRiskAssessment } = await import(
          "@/libraries/risk-assessment/RiskAssessmentIntegration"
        );
        const batchResults = await batchRiskAssessment(barangayData);
        setResults(batchResults);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error in batch risk assessment:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    assessMultiple,
    clearResults,
  };
}

/**
 * Hook for risk level statistics and analytics
 */
export function useRiskAnalytics() {
  const [analytics, setAnalytics] = useState<{
    totalAssessments: number;
    riskLevelDistribution: Record<RiskLevel, number>;
    averageRiskScore: number;
    highRiskAreas: Array<{
      psgccode: string;
      riskScore: number;
      riskLevel: RiskLevel;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAnalytics = useCallback(
    (riskResults: RiskAssessmentResult[]) => {
      const totalAssessments = riskResults.length;
      const riskLevelDistribution = riskResults.reduce((acc, result) => {
        acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<RiskLevel, number>);

      const averageRiskScore =
        riskResults.reduce((sum, result) => sum + result.riskScore, 0) /
        totalAssessments;

      const highRiskAreas = riskResults
        .filter(
          (result) =>
            result.riskLevel === RiskLevel.HIGH ||
            result.riskLevel === RiskLevel.CRITICAL
        )
        .map((result) => ({
          psgccode: "", // Would need to be passed in or tracked
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10); // Top 10 high-risk areas

      setAnalytics({
        totalAssessments,
        riskLevelDistribution,
        averageRiskScore,
        highRiskAreas,
      });
    },
    []
  );

  const clearAnalytics = useCallback(() => {
    setAnalytics(null);
    setError(null);
  }, []);

  return {
    analytics,
    isLoading,
    error,
    calculateAnalytics,
    clearAnalytics,
  };
}
