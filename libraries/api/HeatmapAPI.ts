import { APIBuilder } from "./Builder";
import { HeatmapBarangayData } from "@/models/HeatmapBarangayData";

const dengueAPIBasePath = process.env.NEXT_PUBLIC_DENGUE_API;

if (dengueAPIBasePath === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(dengueAPIBasePath);

const baseApiGroup = "/api/dengue-cases/";

export const HeatmapAPI = {
  getHeatmapData: (year?: number) => {
    const query = year ? { year: year } : undefined;
    return api.get<HeatmapBarangayData[]>(baseApiGroup + "heatmap", query);
  },
};
