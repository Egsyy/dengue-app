// Core risk assessment library
export {
  DengueRiskAssessment,
  RiskLevel,
  assessDengueRisk,
  quickRiskAssessment,
  getRiskLevelText,
  getAlertMessage,
  getRiskSuggestions,
  RISK_LEVEL_CONFIGS,
} from "./DengueRiskAssessment";

// Types and interfaces
export type {
  RiskLevelConfig,
  RiskAssessmentResult,
  DengueSuggestions,
} from "./DengueRiskAssessment";

// Integration utilities
export {
  fetchAndAssessRisk,
  fetchAndAssessRiskCached,
  getHistoricalAverage,
  getRiskAssessmentWithContext,
  batchRiskAssessment,
  getRiskTrend,
  riskAssessmentCache,
} from "./RiskAssessmentIntegration";

// React hooks
export {
  useDengueRiskAssessment,
  useBatchRiskAssessment,
  useRiskAnalytics,
} from "../hooks/useDengueRiskAssessment";

// Hook types
export type {
  UseDengueRiskAssessmentOptions,
  UseDengueRiskAssessmentReturn,
} from "../hooks/useDengueRiskAssessment";
