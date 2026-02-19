import { predicted_case_outbreak_probability } from "@/data/DengueProbability";
import { getChartColors } from "../ui/chart-theme";
import { PredictedDengueCase } from "@/models/PredictedDengueCase";

export const TransformWeeklyOutbreakProbabilityBarChart = (
  data: PredictedDengueCase[]
) => {
  // Find month boundaries
  const monthBoundaries: {
    month: string;
    startWeek: number;
    endWeek: number;
    startIndex: number;
    endIndex: number;
  }[] = [];
  let currentMonth = data[0]?.month_name;
  let startIndex = 0;

  data.forEach((item, index) => {
    if (item.month_name !== currentMonth) {
      monthBoundaries.push({
        month: currentMonth,
        startWeek: data[startIndex].iso_week,
        endWeek: data[index - 1].iso_week,
        startIndex,
        endIndex: index - 1,
      });
      currentMonth = item.month_name;
      startIndex = index;
    }

    if (index === data.length - 1) {
      monthBoundaries.push({
        month: currentMonth,
        startWeek: data[startIndex].iso_week,
        endWeek: item.iso_week,
        startIndex,
        endIndex: index,
      });
    }
  });
  const colors = getChartColors();
  return {
    labels: data.map((item) => `Week ${item.iso_week}`),
    datasets: [
      {
        label: "Outbreak Probability (%)",
        data: data.map((item) => item.outbreak_probability),
        backgroundColor: colors.primary.replace("0.7", "0.9"),
        borderColor: colors.primary.replace("0.7", "1"),
        borderWidth: 0.5,
        borderRadius: 60,
        barThickness: 10, // 👈 fixed bar width (px)
      },
    ],
    monthBoundaries,
  };
};
