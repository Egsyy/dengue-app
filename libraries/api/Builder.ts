import { apiClient } from "./Client";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export class APIBuilder {
  constructor(
    private basePath: string,
    private defaultParams: Record<string, any> = {}
  ) {}

  private buildUrl(path = "", query?: QueryParams): string {
    // Ensure basePath doesn't end with slash and path doesn't start with slash
    const cleanBasePath = this.basePath.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Use URL constructor with two arguments for proper URL joining
    const url = new URL(cleanPath, cleanBasePath);

    // Merge default params with query params
    const allParams = { ...this.defaultParams, ...query };

    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  async get<T>(path = "", query?: QueryParams, options?: RequestInit) {
    // console.log(`GET: ${this.buildUrl(path, query)}`);
    return apiClient.get<T>(this.buildUrl(path, query), {
      ...options,
      method: "GET",
    });
  }

  async post<T>(path = "", body?: unknown, options?: RequestInit) {
    // console.log(`POST: ${this.buildUrl(path)}`);
    const url = this.buildUrl(path);
    // Extract just the pathname part to avoid double base URL
    const urlObj = new URL(url);
    return apiClient.request<T>(urlObj.pathname + urlObj.search, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(path = "", body?: unknown, options?: RequestInit) {
    // console.log(`PUT: ${this.buildUrl(path)}`);
    const url = this.buildUrl(path);
    // Extract just the pathname part to avoid double base URL
    const urlObj = new URL(url);
    return apiClient.request<T>(urlObj.pathname + urlObj.search, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path = "", body?: unknown, options?: RequestInit) {
    // console.log(`PATCH: ${this.buildUrl(path)}`);
    const url = this.buildUrl(path);
    // Extract just the pathname part to avoid double base URL
    const urlObj = new URL(url);
    return apiClient.request<T>(urlObj.pathname + urlObj.search, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path = "", options?: RequestInit) {
    // console.log(`DELETE: ${this.buildUrl(path)}`);
    const url = this.buildUrl(path);
    // Extract just the pathname part to avoid double base URL
    const urlObj = new URL(url);
    return apiClient.request<T>(urlObj.pathname + urlObj.search, {
      ...options,
      method: "DELETE",
    });
  }

  // Set default parameters for all requests
  setDefaultParams(params: Record<string, any>) {
    this.defaultParams = { ...this.defaultParams, ...params };
  }

  // Get current default parameters
  getDefaultParams() {
    return { ...this.defaultParams };
  }

  // Check base path
  checkBasePath() {
    return this.basePath;
  }
}
