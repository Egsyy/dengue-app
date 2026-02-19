import { AdministrativeArea } from "@models/AdministrativeArea";
import { APIBuilder } from "./Builder";
import { YearlyHistoricalDengueCases } from "@/models/HistoricalDengueCase";
import { LatestWeatherDate } from "@/models/WeatherPooledData";

const weatherPooledAPIBasePath = process.env.NEXT_PUBLIC_DENGUE_API;

if (weatherPooledAPIBasePath === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(weatherPooledAPIBasePath);

const baseApiGroup = "/api/weatherpooling/";

export const WeatherPoolingData = {
  getLatestWeatherPooledDate: () => {
    const historicalData = api.get<LatestWeatherDate>(baseApiGroup + "latest/");
    return historicalData;
  },
  manualTriggerWeatherPooling: () => {
    const result = api.post(baseApiGroup + "manual-trigger", {});
    return result;
  },
};
