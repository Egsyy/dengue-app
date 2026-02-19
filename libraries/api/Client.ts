interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.config.headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    };

    // Attach Authorization header if access token is available in localStorage
    try {
      const stored = localStorage.getItem("dengue_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Use backend access token (validated JWT) or Supabase access token
        const token = parsed?.accessToken || parsed?.access_token || parsed?.supabaseSession?.accessToken;
        if (token) {
          (defaultOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch {}

    let lastError: ApiError | null = null;
    let attempt = 0;

    while (attempt <= this.config.retries) {
      try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            `API Error: ${response.status} ${response.statusText}`,
            response.status,
            errorData?.code || "UNKNOWN_ERROR",
            errorData?.details
          );
        }

        return await response.json();
      } catch (error) {
        lastError =
          error instanceof Error
            ? (error as ApiError)
            : new Error("Unknown error occurred");
        attempt++;

        if (attempt <= this.config.retries) {
          // Exponential backoff: wait 1s, 2s, 4s between retries
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
          );
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  async get<T>(path = "", query?: Record<string, any>, options?: RequestInit) {
    const url = new URL(path, this.config.baseURL);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(path = "", body?: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(path = "", body?: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path = "", body?: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path = "", options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  }
}

class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_DENGUE_API || "",
  timeout: 10000,
  retries: 2,
  headers: {
    "X-Application": "Dengue-Watch",
  },
});

export { ApiError };
export type { ApiConfig };
