import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
	throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/dengue-cases/";

/**
 * Weekly Dengue Case response model
 */
export type WeeklyDengueCase = {
	id: number;
	psgcCode: string;
	barangayName: string;
	year: number;
	weekNumber: number;
	caseCount: number;
};

/**
 * Paginated list response
 */
export type WeeklyDengueCasesListResponse = {
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	cases: WeeklyDengueCase[];
};

/**
 * Create weekly dengue case request
 */
export type CreateWeeklyDengueCaseRequest = {
	psgcCode: string;
	year: number;
	weekNumber: number;
	caseCount: number;
};

/**
 * Update weekly dengue case request
 */
export type UpdateWeeklyDengueCaseRequest = {
	year?: number;
	weekNumber?: number;
	caseCount?: number;
};

/**
 * Get weekly dengue cases with pagination
 */
export const getWeeklyDengueCases = async (
	pageNumber: number = 1,
	pageSize: number = 20,
	psgcCode?: string,
	year?: number
): Promise<WeeklyDengueCasesListResponse> => {
	const params: Record<string, string> = {
		PageNumber: pageNumber.toString(),
		PageSize: pageSize.toString(),
	};

	if (psgcCode) params.PsgcCode = psgcCode;
	if (year) params.Year = year.toString();

	return api.get<WeeklyDengueCasesListResponse>(baseApiGroup + "weekly", params);
};

/**
 * Get a single weekly dengue case by ID
 */
export const getWeeklyDengueCaseById = async (
	id: number
): Promise<WeeklyDengueCase> => {
	return api.get<WeeklyDengueCase>(baseApiGroup + "weekly/" + id);
};

/**
 * Create a new weekly dengue case
 */
export const createWeeklyDengueCase = async (
	payload: CreateWeeklyDengueCaseRequest
): Promise<WeeklyDengueCase> => {
	return api.post<WeeklyDengueCase>(baseApiGroup + "weekly", payload);
};

/**
 * Update an existing weekly dengue case
 */
export const updateWeeklyDengueCase = async (
	id: number,
	payload: UpdateWeeklyDengueCaseRequest
): Promise<WeeklyDengueCase> => {
	return api.put<WeeklyDengueCase>(baseApiGroup + "weekly/" + id, payload);
};

/**
 * Delete a weekly dengue case
 */
export const deleteWeeklyDengueCase = async (id: number): Promise<void> => {
	return api.delete<void>(baseApiGroup + "weekly/" + id);
};

const WeeklyDengueCaseAPI = {
	getWeeklyDengueCases,
	getWeeklyDengueCaseById,
	createWeeklyDengueCase,
	updateWeeklyDengueCase,
	deleteWeeklyDengueCase,
};

export default WeeklyDengueCaseAPI;
