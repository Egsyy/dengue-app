import { PredictedDengueCase } from "@/models/PredictedDengueCase";

/**
 * Risk level categories for dengue prediction
 */
export enum RiskLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Risk level configuration with thresholds and colors
 */
export interface RiskLevelConfig {
  level: RiskLevel;
  threshold: {
    min: number;
    max: number;
  };
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

/**
 * Risk assessment result containing all relevant information
 */
export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number;
  riskPercentage: number;
  config: RiskLevelConfig;
  suggestions: string[];
  preventiveMeasures: string[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Dengue risk suggestion categories
 */
export interface DengueSuggestions {
  general: string[];
  community: string[];
  personal: string[];
  environmental: string[];
}

/**
 * Get risk level configurations with environment variable thresholds
 */
export const getRiskLevelConfigs = (): RiskLevelConfig[] => {
  // Read environment variables with fallback defaults
  const lowThreshold = parseInt(
    process.env.NEXT_PUBLIC_RISK_FACTOR_LOW_TRESHOLD || "20"
  );
  const highStart = parseInt(
    process.env.NEXT_PUBLIC_RISK_FACTOR_HIGH_START || "70"
  );

  // Calculate moderate threshold range
  const moderateMin = lowThreshold + 1;
  const moderateMax = highStart;

  // Calculate high threshold range
  const highMin = highStart + 1;
  const highMax = 80; // Fixed upper bound for high

  return [
    {
      level: RiskLevel.LOW,
      threshold: { min: 0, max: lowThreshold },
      color: "text-success",
      bgColor: "bg-success",
      borderColor: "border-success",
      description: "Low risk of dengue transmission",
    },
    {
      level: RiskLevel.MODERATE,
      threshold: { min: moderateMin, max: moderateMax },
      color: "text-warning",
      bgColor: "bg-warning",
      borderColor: "border-warning",
      description: "Moderate risk of dengue transmission",
    },
    {
      level: RiskLevel.HIGH,
      threshold: { min: highMin, max: highMax },
      color: "text-error",
      bgColor: "bg-error",
      borderColor: "border-error",
      description: "High risk of dengue transmission",
    },
    {
      level: RiskLevel.CRITICAL,
      threshold: { min: highMax + 1, max: 100 },
      color: "text-error",
      bgColor: "bg-error",
      borderColor: "border-error",
      description: "Critical risk of dengue transmission",
    },
  ];
};

/**
 * Risk level configurations with DaisyUI-compatible color classes
 * @deprecated Use getRiskLevelConfigs() instead to get environment-specific configurations
 */
export const RISK_LEVEL_CONFIGS: RiskLevelConfig[] = getRiskLevelConfigs();

/**
 * Suggestion templates for different risk levels
 */
const RISK_SUGGESTIONS: Record<RiskLevel, DengueSuggestions> = {
  [RiskLevel.LOW]: {
    general: [
      "Do weekly “Search and Destroy” at home and remove clutter like flower pots, cans, bottles, tires, buckets where water can collect.",
      "Make sure all water containers are covered (drums, gallons, pails).",
      "Use mosquito repellent, especially during early morning and late afternoon.",
      "Report clogged canals to barangay so they can clean them.",
    ],
    community: [
      // "Conduct regular clean-up drives",
      // "Maintain community awareness programs",
    ],
    personal: [
      // "Use mosquito repellent during outdoor activities",
      // "Wear protective clothing (long sleeves, pants)",
    ],
    environmental: [
      // "Check and clean water containers weekly",
      // "Properly dispose of unused containers",
    ],
  },
  [RiskLevel.MODERATE]: {
    general: [
      "Check your home every 3 days — mosquitoes can breed faster.",
      "Encourage neighbors to join cleanup efforts; remind each other to empty containers.",
      "Use mosquito nets while sleeping.",
      "Install window screens or ensure close windows starting dusk until dawn.",
      "Clean roof gutters. (If applicable)",
      "Avoid storing water outside the house unless tightly covered.",
      "Participate in barangay information drives and share updates.",
    ],
    community: [
      // "Organize weekly clean-up campaigns",
      // "Coordinate with local health authorities",
      // "Set up community monitoring posts",
    ],
    personal: [
      // "Apply mosquito repellent regularly",
      // "Use mosquito nets while sleeping",
      // "Avoid outdoor activities during peak mosquito hours (dawn/dusk)",
    ],
    environmental: [
      // "Eliminate standing water sources",
      // "Clean gutters and drainage systems",
      // "Cover water storage containers properly",
    ],
  },
  [RiskLevel.HIGH]: {
    general: [
      "Do daily checks around your home for standing water.",
      "Use stronger protection: repellents, coils, mosquito killer lamps, electric swatters.",
      "Avoid dark, humid areas where mosquitoes usually rest.",
      "Encourage your household to seek medical attention early if fever appears.",
      "Help neighbors clean shared spaces — alleys, pathways, vacant lots.",
      "Stay updated with barangay announcements about dengue clusters.",
      "Avoid leaving doors/windows open around sunrise and sunset when mosquitoes are active.",
    ],
    community: [
      // "Conduct daily fogging operations in high-risk areas",
      // "Establish rapid response teams",
      // "Coordinate with hospitals for preparedness",
    ],
    personal: [
      // "Strictly avoid mosquito bites",
      // "Seek immediate medical attention for symptoms",
      // "Use insecticide-treated materials",
    ],
    environmental: [
      // "Intensive search and destroy of breeding sites",
      // "Regular environmental inspections",
      // "Implement larviciding programs",
    ],
  },
  [RiskLevel.CRITICAL]: {
    general: [
      "Protect yourself at all times — repellent every day, long clothing, mosquito nets at night.",
      "Eliminate ALL standing water daily, including small ones (bottle caps, plant bases).",
      "Avoid unnecessary outdoor activities during mosquito peak hours.",
      "Encourage sick or feverish family members to get checked immediately — do NOT wait 2–3 days.",
      "Cover all gaps in windows or doors; use screen patches or tape if needed.",
      "Assist in community cleanups; outbreaks need everyone’s participation.",
      "Disinfect and clean dark corners where mosquitoes hide (under tables, cabinets).",
      "Share verified information only — avoid posting false rumors that cause panic.",
    ],
    community: [
      // "Declare state of alert in affected areas",
      // "Conduct emergency fogging operations",
      // "Set up temporary treatment centers",
    ],
    personal: [
      // "Stay indoors as much as possible",
      // "Use maximum protection against mosquitoes",
      // "Monitor health closely and seek immediate care for symptoms",
    ],
    environmental: [
      // "Emergency environmental cleanup operations",
      // "Intensive larviciding and adulticiding",
      // "24/7 monitoring of breeding sites",
    ],
  },
};

/**
 * Dengue Risk Assessment Helper Class
 */
export class DengueRiskAssessment {
  /**
   * Get risk level configuration based on prediction value
   */
  static getRiskConfig(predictionValue: number): RiskLevelConfig {
    const configs = getRiskLevelConfigs();
    const config = configs.find(
      (config) =>
        predictionValue >= config.threshold.min &&
        predictionValue <= config.threshold.max
    );

    return config || configs[0]; // Default to low risk if no match
  }

  /**
   * Calculate risk score based on prediction value and historical context
   */
  static calculateRiskScore(
    predictionValue: number,
    historicalAverage?: number
  ): number {
    let baseScore = predictionValue;

    // Adjust score based on historical context if available
    if (historicalAverage !== undefined) {
      const deviation = predictionValue - historicalAverage;
      const adjustment =
        Math.sign(deviation) * Math.min(Math.abs(deviation) * 0.2, 20);
      baseScore = Math.max(0, Math.min(100, baseScore + adjustment));
    }

    return Math.round(baseScore);
  }

  /**
   * Get urgency level based on risk level
   */
  static getUrgencyLevel(
    riskLevel: RiskLevel
  ): "low" | "medium" | "high" | "critical" {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return "low";
      case RiskLevel.MODERATE:
        return "medium";
      case RiskLevel.HIGH:
        return "high";
      case RiskLevel.CRITICAL:
        return "critical";
      default:
        return "low";
    }
  }

  /**
   * Get suggestions for a specific risk level and category
   */
  static getSuggestions(
    riskLevel: RiskLevel,
    category?: keyof DengueSuggestions
  ): string[] {
    const suggestions = RISK_SUGGESTIONS[riskLevel];

    if (category) {
      return suggestions[category];
    }

    return [
      ...suggestions.general,
      ...suggestions.community,
      ...suggestions.personal,
      ...suggestions.environmental,
    ];
  }

  /**
   * Get preventive measures based on risk level
   */
  static getPreventiveMeasures(riskLevel: RiskLevel): string[] {
    const suggestions = RISK_SUGGESTIONS[riskLevel];

    return [...suggestions.personal, ...suggestions.environmental];
  }

  /**
   * Comprehensive risk assessment for a dengue case
   */
  static assessRisk(
    dengueCase: PredictedDengueCase,
    historicalAverage?: number
  ): RiskAssessmentResult {
    const predictionValue = dengueCase.outbreak_probability;
    const riskConfig = this.getRiskConfig(predictionValue);
    const riskScore = this.calculateRiskScore(
      predictionValue,
      historicalAverage
    );
    const urgencyLevel = this.getUrgencyLevel(riskConfig.level);

    return {
      riskLevel: riskConfig.level,
      riskScore,
      riskPercentage: predictionValue,
      config: riskConfig,
      suggestions: this.getSuggestions(riskConfig.level),
      preventiveMeasures: this.getPreventiveMeasures(riskConfig.level),
      urgencyLevel,
    };
  }

  /**
   * Quick risk assessment using only prediction value
   */
  static quickRiskAssessment(predictionValue: number): RiskAssessmentResult {
    const riskConfig = this.getRiskConfig(predictionValue);
    const riskScore = this.calculateRiskScore(predictionValue);
    const urgencyLevel = this.getUrgencyLevel(riskConfig.level);

    return {
      riskLevel: riskConfig.level,
      riskScore,
      riskPercentage: predictionValue,
      config: riskConfig,
      suggestions: this.getSuggestions(riskConfig.level),
      preventiveMeasures: this.getPreventiveMeasures(riskConfig.level),
      urgencyLevel,
    };
  }

  /**
   * Get risk level trend based on multiple data points
   */
  static getRiskTrend(
    currentValue: number,
    previousValue: number
  ): "improving" | "stable" | "worsening" {
    const difference = currentValue - previousValue;
    const threshold = 5; // 5% threshold for considering change significant

    if (Math.abs(difference) < threshold) {
      return "stable";
    }

    return difference > 0 ? "worsening" : "improving";
  }

  /**
   * Get DaisyUI compatible progress bar value for risk visualization
   */
  static getProgressValue(predictionValue: number): number {
    return Math.min(100, Math.max(0, predictionValue));
  }

  /**
   * Get formatted risk level text for display
   */
  static getRiskLevelText(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return "Low Risk";
      case RiskLevel.MODERATE:
        return "Moderate Risk";
      case RiskLevel.HIGH:
        return "High Risk";
      case RiskLevel.CRITICAL:
        return "Critical Risk";
      default:
        return "Unknown Risk";
    }
  }

  /**
   * Get alert message based on risk level
   */
  static getAlertMessage(riskLevel: RiskLevel, barangayName?: string): string {
    const location = barangayName ? "in " + barangayName : "in your area";

    switch (riskLevel) {
      case RiskLevel.LOW:
        return `Dengue risk is low ${location}. Continue standard preventive measures.`;
      case RiskLevel.MODERATE:
        return `Dengue risk is moderate ${location}. Increase vigilance and preventive measures.`;
      case RiskLevel.HIGH:
        return `High dengue risk detected ${location}. Take immediate preventive action.`;
      case RiskLevel.CRITICAL:
        return `CRITICAL: Dengue outbreak risk ${location}. Take emergency precautions immediately.`;
      default:
        return "Risk assessment unavailable.";
    }
  }
}

/**
 * Convenience functions for quick access to common operations
 */
export const assessDengueRisk = (
  dengueCase: PredictedDengueCase,
  historicalAverage?: number
) => DengueRiskAssessment.assessRisk(dengueCase, historicalAverage);

export const quickRiskAssessment = (predictionValue: number) =>
  DengueRiskAssessment.quickRiskAssessment(predictionValue);

export const getRiskLevelText = (riskLevel: RiskLevel) =>
  DengueRiskAssessment.getRiskLevelText(riskLevel);

export const getAlertMessage = (riskLevel: RiskLevel, barangayName?: string) =>
  DengueRiskAssessment.getAlertMessage(riskLevel, barangayName);

export const getRiskSuggestions = (
  riskLevel: RiskLevel,
  category?: keyof DengueSuggestions
) => DengueRiskAssessment.getSuggestions(riskLevel, category);
