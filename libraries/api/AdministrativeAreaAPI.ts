import { AdministrativeArea } from "@models/AdministrativeArea";
import { APIBuilder } from "./Builder";

const dengueAPIBasePath = process.env.NEXT_PUBLIC_DENGUE_API;

if (dengueAPIBasePath === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(dengueAPIBasePath);

export const Localities = {
  getAllRegions: () => {
    const ap = api.get<AdministrativeArea[]>(
      "/api/administrative-areas/regions"
    );
    // TODO

    return ap;
  },
  getAllBarangaysByPsgccode: (psgccode: string) => {
    const brgys = api.get<AdministrativeArea[]>(
      `/api/administrative-areas/localities/${psgccode}/barangays`
    );
    return brgys;
  },
};
