export interface PredictedDengueCase {
  psgccode: string;
  barangay_name: string;
  month_name: string;
  iso_year: number;
  iso_week: number;
  lagged_week: number;
  lagged_year: number;
  value_predicted: number;
  outbreak_probability: number;
}
