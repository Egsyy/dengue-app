export type HeatmapBarangayData = {
  psgcCode: string;
  barangayName: string;
  latitude: number;
  longitude: number;
  totalCases: number;
  currentYearCases: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
};
