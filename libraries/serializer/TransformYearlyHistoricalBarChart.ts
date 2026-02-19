import { YearlyHistoricalDengueCases } from "@/models/HistoricalDengueCase";

export function TransformToYearlyCasesToChart(
  data?: YearlyHistoricalDengueCases,
) {
  const cases = data?.recorded_cases ?? [];

  const labels = cases?.map((x) => x.year);
  const values = cases?.map((x) => x.total_cases);
  // console.log(colors);
  return {
    labels,
    datasets: [
      {
        label: "Dengue Cases",
        data: values,
        borderRadius: {
          topLeft: 24,
          topRight: 24,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: "bottom", // Rounded corners
        barThickness: 48,
      },
    ],
  };
}
