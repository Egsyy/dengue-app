import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
  throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/training-data/";

export const TrainingAPI = {
  getAdvanceModelInfo: () => api.get(baseApiGroup + "model-info"),
  trainAdvanceModel: (payload?: any) => api.post(baseApiGroup + "advanced", payload),
  generateWeeklyWeatherCsv: async (payload?: any) => {
    const url = base.replace(/\/$/, "") + "/api/training-data/weekly-weather/all/csv";

    // attach auth header similar to apiClient
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const stored = localStorage.getItem("dengue_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.accessToken || parsed?.access_token || parsed?.supabaseSession?.accessToken;
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {}

    const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Failed to generate CSV: ${resp.status} ${resp.statusText} ${txt}`);
    }
    return resp.blob();
  },
};

export default TrainingAPI;
