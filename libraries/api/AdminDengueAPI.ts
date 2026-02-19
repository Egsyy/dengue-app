import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/dengue-cases/";

export const AdminDengueAPI = {
  manualAdvancePrediction: (psgccode: string, dt: string) =>
    api.post(baseApiGroup + "advance", { psgccode, dt }),
  createBulkCsvForPrediction: (payload: any) =>
    api.post(baseApiGroup + "create-bulk", payload),
  createYearlyLaggedAdvance: (payload: any) =>
    api.post(baseApiGroup + "advance/year-minus-one", payload),
  testDateExtraction: () => api.get(baseApiGroup + "test-date-extraction"),
};

export default AdminDengueAPI;
