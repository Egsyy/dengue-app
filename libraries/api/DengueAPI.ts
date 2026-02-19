import { format } from "date-fns";
import { APIBuilder } from "./Builder";
import { PredictedDengueCase } from "@/models/PredictedDengueCase";
import { Last5YearsPredictedResponse } from "@/models/Last5YearsPredictedResponse";
import { YearlyAverageResponse, MonthlyAverageResponse, MonthlyAverageOutbreakProbabilityResponse } from "@/models/Statistics";

const dengueAPIBasePath = process.env.NEXT_PUBLIC_DENGUE_API;

if (dengueAPIBasePath === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(dengueAPIBasePath);

const baseApiGroup = "/api/dengue-cases/";

export type PredictedDengueCaseResponse = {
  page_size: number;
  page_number: number;
  predictions: PredictedDengueCase[];
};

export type MonthlyDengueCase = {
  month: number;
  caseCount: number;
};

export type MonthlyDengueCasesResponse = {
  psgcCode: string;
  year: number;
  monthlyCases: MonthlyDengueCase[];
};

export const DengueCasesAPI = {
  // Get cases by date range
  getOneWeekPrediction: (psgccode: string, selectedDate: string) => {
    const data = api.get<PredictedDengueCase>(baseApiGroup + psgccode, {
      dt: selectedDate,
    });
    return data;
  },

  getWeeklyPredictionWithParams: (psgccode: string) => {
    const data = api.get<PredictedDengueCaseResponse>(
      baseApiGroup + "predictions/" + psgccode,
      {
        page_size: 6,
        page_number: 1,
      },
    );

    return data;
  },

  predictDengueCase: (psgccode: string, selectedDate: string) => {
    const fetchPost = api.post<PredictedDengueCase>(baseApiGroup + "advance", {
      psgccode: psgccode,
      dt: selectedDate,
    });
    return fetchPost;
  },

  /**
   * Fetches last 5 years of predicted dengue cases for a specific barangay.
   * @param psgccode - The PSGC code of the barangay
   * @param page - Page number for pagination (default: 1)
   * @returns Promise with paginated predicted dengue cases for the last 5 years
   */
  getLast5YearsPredictions: (psgccode: string, page: number = 1) => {
    return api.get<Last5YearsPredictedResponse>(
      baseApiGroup + "predicted/" + psgccode + "/last-5-years",
      {
        Page: page,
      },
    );
  },

  /**
   * Fetch monthly dengue cases for a barangay and year.
   * GET /api/dengue-cases/monthly/{psgccode}?Year=YYYY
   */
  getMonthlyCases: (psgccode: string, year: number) => {
    return api.get<MonthlyDengueCasesResponse>(
      baseApiGroup + "monthly/" + psgccode,
      {
        Year: year,
      },
    );
  },

  /**
   * Get yearly average predicted dengue cases by PSGC code and ISO year.
   * GET /api/dengue-cases/{psgccode}/yearly-average/{year}
   */
  getYearlyAverage: (psgccode: string, year: number) => {
    return api.get<YearlyAverageResponse>(
      baseApiGroup + psgccode + "/yearly-average/" + year
    );
  },

  /**
   * Get monthly average predicted dengue cases by PSGC code and ISO year.
   * GET /api/dengue-cases/{psgccode}/monthly-average/{year}
   */
  getMonthlyAverage: (psgccode: string, year: number) => {
    return api.get<MonthlyAverageResponse>(
      baseApiGroup + psgccode + "/monthly-average/" + year
    );
  },

  /**
   * Get monthly average outbreak probability by PSGC code and ISO year.
   * GET /api/dengue-cases/{psgccode}/monthly-average-outbreak-probability/{year}
   */
  getMonthlyAverageOutbreakProbability: (psgccode: string, year: number) => {
    return api.get<MonthlyAverageOutbreakProbabilityResponse>(
      baseApiGroup + psgccode + "/monthly-average-outbreak-probability/" + year
    );
  },
};
