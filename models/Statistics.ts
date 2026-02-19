/**
 * Response model for yearly average predicted dengue cases
 */
export type YearlyAverageResponse = {
  psgcCode: string;
  barangayName: string;
  year: number;
  averagePredictedCases: number;
  totalWeeks: number;
  minPredictedCases: number;
  maxPredictedCases: number;
  averagePredictedOutbreakProbability: number;
};

/**
 * Monthly data for monthly average response
 */
export type MonthlyData = {
  month: number;
  monthName: string;
  averagePredictedCases: number;
  totalWeeks: number;
  minPredictedCases: number;
  maxPredictedCases: number;
};

/**
 * Response model for monthly average predicted dengue cases
 */
export type MonthlyAverageResponse = {
  psgcCode: string;
  barangayName: string;
  year: number;
  monthlyData: MonthlyData[];
  yearlyAverage: number;
};

/**
 * Monthly outbreak probability data for monthly average outbreak probability response
 */
export type MonthlyOutbreakProbabilityData = {
  month: number;
  monthName: string;
  averageOutbreakProbability: number;
  totalWeeks: number;
  minOutbreakProbability: number;
  maxOutbreakProbability: number;
};

/**
 * Response model for monthly average outbreak probability
 */
export type MonthlyAverageOutbreakProbabilityResponse = {
  psgcCode: string;
  barangayName: string;
  year: number;
  monthlyData: MonthlyOutbreakProbabilityData[];
  yearlyAverage: number;
};