import type { MonthlyDengueCasesResponse } from "@/libraries/api/DengueAPI";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type MonthlyCasesBarChartPoint = {
  month: string;
  caseCount: number;
};

export function TransformMonthlyDengueCasesToBarChart(
  response: MonthlyDengueCasesResponse | null | undefined,
  options?: { fillMissingMonths?: boolean },
): MonthlyCasesBarChartPoint[] {
  const fillMissingMonths = options?.fillMissingMonths ?? true;

  if (!response) {
    return [];
  }

  const monthToCases = new Map<number, number>();
  for (const item of response.monthlyCases ?? []) {
    if (typeof item?.month !== "number") continue;
    if (typeof item?.caseCount !== "number") continue;
    monthToCases.set(item.month, item.caseCount);
  }

  const points: MonthlyCasesBarChartPoint[] = [];

  if (fillMissingMonths) {
    for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
      points.push({
        month: MONTH_LABELS[monthIndex - 1] ?? String(monthIndex),
        caseCount: monthToCases.get(monthIndex) ?? 0,
      });
    }
    return points;
  }

  // Only return months present in the payload (sorted by month)
  const sortedMonths = Array.from(monthToCases.keys()).sort((a, b) => a - b);
  for (const month of sortedMonths) {
    points.push({
      month: MONTH_LABELS[month - 1] ?? String(month),
      caseCount: monthToCases.get(month) ?? 0,
    });
  }

  return points;
}
