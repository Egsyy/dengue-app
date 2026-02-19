import { PredictedDengueCase } from "./PredictedDengueCase";

export interface ListPredictedDengueCaseResponse {
  page_number: number;
  page_size: number;
  predictions: PredictedDengueCase[];
}
