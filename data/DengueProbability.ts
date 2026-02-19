import { YearlyHistoricalDengueCases } from "@/models/HistoricalDengueCase";
import { PredictedDengueCase } from "@/models/PredictedDengueCase";
import { DecimationAlgorithm } from "chart.js";

export type predicted_case_outbreak_probability = {
  month: string;
  iso_week: number;
  iso_year: number;
  probability: number;
};

export const SampleData: YearlyHistoricalDengueCases = {
  psgccode: "0931700001",
  recorded_cases: [
    {
      year: "2014",
      total_cases: 12,
    },
    {
      year: "2015",
      total_cases: 19,
    },
    {
      year: "2016",
      total_cases: 34,
    },
    {
      year: "2017",
      total_cases: 29,
    },
    {
      year: "2018",
      total_cases: 15,
    },
    {
      year: "2019",
      total_cases: 37,
    },
    {
      year: "2020",
      total_cases: 2,
    },
    {
      year: "2021",
      total_cases: 37,
    },
    {
      year: "2022",
      total_cases: 12,
    },
    {
      year: "2023",
      total_cases: 3,
    },
  ],
};

export const ProbabilitySampleData: PredictedDengueCase[] = [
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Feb",
    iso_year: 2014,
    iso_week: 16,
    lagged_week: 14,
    lagged_year: 16,
    value_predicted: 1,
    outbreak_probability: 33.567222595214844,
  },
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Feb",
    iso_year: 2014,
    iso_week: 17,
    lagged_week: 15,
    lagged_year: 17,
    value_predicted: 1,
    outbreak_probability: 35.17383575439453,
  },
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Feb",
    iso_year: 2014,
    iso_week: 18,
    lagged_week: 16,
    lagged_year: 18,
    value_predicted: 1,
    outbreak_probability: 35.5318603515625,
  },
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Mar",
    iso_year: 2014,
    iso_week: 19,
    lagged_week: 17,
    lagged_year: 19,
    value_predicted: 1,
    outbreak_probability: 34.999961853027344,
  },
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Mar",
    iso_year: 2014,
    iso_week: 20,
    lagged_week: 18,
    lagged_year: 20,
    value_predicted: 1,
    outbreak_probability: 34.85506820678711,
  },
  {
    psgccode: "0931700001",
    barangay_name: "Arena Blanco",
    month_name: "Mar",
    iso_year: 2014,
    iso_week: 21,
    lagged_week: 19,
    lagged_year: 21,
    value_predicted: 1,
    outbreak_probability: 35.03949737548828,
  },
];
