import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/weathersummary/";

export const WeatherSummaryAPI = {
  getCurrentWeek: () => api.get(baseApiGroup + "current-week"),
  getLagged2Week: () => api.get(baseApiGroup + "lagged-2week"),
  getCoverage: () => api.get(baseApiGroup + "coverage"),
};

export default WeatherSummaryAPI;
