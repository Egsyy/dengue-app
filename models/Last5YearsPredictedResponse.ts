export interface PredictionValue {
  predictionId: string;
  psgcCode: string;
  laggedIsoYear: number;
  laggedIsoWeek: number;
  predictedIsoYear: number;
  predictedIsoWeek: number;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
  confidencePercentage: number;
  probabilityOfOutbreak: number;
  riskLevel: string;
  monthName: string;
}

export interface YearlyPredictions {
  isoYear: number;
  values: PredictionValue[];
}

export interface Last5YearsPredictedResponse {
  psgcCode: string;
  page: number;
  pageSizeYears: number;
  years: number[];
  values: YearlyPredictions[];
}
