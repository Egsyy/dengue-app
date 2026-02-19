import { APIBuilder } from "./Builder";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
	throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/advisories/";

/**
 * Risk level enum
 */
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

/**
 * Community Advisory response model
 */
export type CommunityAdvisory = {
	id: string;
	title: string;
	description: string;
	actionPlan: string;
	riskLevel: RiskLevel;
	createdAt: string;
	updatedAt: string;
	createdBy?: string;
	isActive: boolean;
};

/**
 * Paginated list response
 */
export type AdvisoriesListResponse = {
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	advisories: CommunityAdvisory[];
};

/**
 * Create advisory request
 */
export type CreateAdvisoryRequest = {
	title: string;
	description: string;
	actionPlan: string;
	riskLevel: RiskLevel;
};

/**
 * Update advisory request
 */
export type UpdateAdvisoryRequest = {
	title?: string;
	description?: string;
	actionPlan?: string;
	riskLevel?: RiskLevel;
	isActive?: boolean;
};

/**
 * Get advisories with pagination and filtering
 */
export const getAdvisories = async (
	pageNumber: number = 1,
	pageSize: number = 20,
	riskLevel?: RiskLevel,
	isActive?: boolean
): Promise<AdvisoriesListResponse> => {
	const params: Record<string, string> = {
		PageNumber: pageNumber.toString(),
		PageSize: pageSize.toString(),
	};

	if (riskLevel) params.RiskLevel = riskLevel;
	if (isActive !== undefined) params.IsActive = isActive.toString();

	return api.get<AdvisoriesListResponse>(baseApiGroup, params);
};

/**
 * Get all advisories without pagination
 */
export const getAllAdvisories = async (): Promise<CommunityAdvisory[]> => {
	return api.get<CommunityAdvisory[]>(baseApiGroup + "all");
};

/**
 * Get a single advisory by ID
 */
export const getAdvisoryById = async (
	id: string
): Promise<CommunityAdvisory> => {
	return api.get<CommunityAdvisory>(baseApiGroup + id);
};

/**
 * Create a new advisory
 */
export const createAdvisory = async (
	payload: CreateAdvisoryRequest
): Promise<CommunityAdvisory> => {
	return api.post<CommunityAdvisory>(baseApiGroup, payload);
};

/**
 * Update an existing advisory
 */
export const updateAdvisory = async (
	id: string,
	payload: UpdateAdvisoryRequest
): Promise<CommunityAdvisory> => {
	return api.put<CommunityAdvisory>(baseApiGroup + id, payload);
};

/**
 * Delete an advisory
 */
export const deleteAdvisory = async (id: string): Promise<void> => {
	return api.delete<void>(baseApiGroup + id);
};

const AdvisoriesAPI = {
	getAdvisories,
	getAllAdvisories,
	getAdvisoryById,
	createAdvisory,
	updateAdvisory,
	deleteAdvisory,
};

export default AdvisoriesAPI;
