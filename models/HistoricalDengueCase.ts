export interface YearlyHistoricalDengueCases {
  psgccode: string | null;
  recorded_cases: YearlyTotalDengueCases[];
}

export interface YearlyTotalDengueCases {
  year: string;
  total_cases: number;
}
