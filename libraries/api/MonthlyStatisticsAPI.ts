import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
	throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/dengue-cases/";

/**
 * Monthly average item
 */
export type MonthlyAverageItem = {
	month: number;
	monthName: string;
	averageValue: number;
};

/**
 * Monthly average response
 */
export type MonthlyAverageResponse = {
	psgcCode?: string;
	year?: number;
	monthlyAverages: MonthlyAverageItem[];
};

/**
 * Monthly comparison item
 */
export type MonthlyComparisonItem = {
	month: number;
	monthName: string;
	averagePredicted: number;
	averageActual: number;
};

/**
 * Monthly comparison response
 */
export type MonthlyComparisonResponse = {
	psgcCode?: string;
	year?: number;
	data: MonthlyComparisonItem[];
};

/**
 * Get average predicted dengue cases per month
 */
export const getMonthlyAveragePredictions = async (
	psgcCode?: string,
	year?: number
): Promise<MonthlyAverageResponse> => {
	const params: Record<string, string> = {};
	if (psgcCode) params.psgcCode = psgcCode;
	if (year) params.year = year.toString();

	return api.get<MonthlyAverageResponse>(
		baseApiGroup + "monthly-averages/predicted",
		params
	);
};

/**
 * Get average actual dengue cases per month
 */
export const getMonthlyAverageCases = async (
	psgcCode?: string,
	year?: number
): Promise<MonthlyAverageResponse> => {
	const params: Record<string, string> = {};
	if (psgcCode) params.psgcCode = psgcCode;
	if (year) params.year = year.toString();

	return api.get<MonthlyAverageResponse>(
		baseApiGroup + "monthly-averages/actual",
		params
	);
};

/**
 * Get comparison of predicted vs actual cases per month
 */
export const getMonthlyComparison = async (
	psgcCode?: string,
	year?: number
): Promise<MonthlyComparisonResponse> => {
	const params: Record<string, string> = {};
	if (psgcCode) params.psgcCode = psgcCode;
	if (year) params.year = year.toString();

	return api.get<MonthlyComparisonResponse>(
		baseApiGroup + "monthly-averages/comparison",
		params
	);
};

const MonthlyStatisticsAPI = {
	getMonthlyAveragePredictions,
	getMonthlyAverageCases,
	getMonthlyComparison,
};

export default MonthlyStatisticsAPI;
