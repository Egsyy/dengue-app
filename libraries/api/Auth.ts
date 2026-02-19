import { APIBuilder } from "./Builder";
import { createSupabaseBrowserClient, SupabaseAuth } from "../supabase/client";

const base = process.env.NEXT_PUBLIC_DENGUE_API;

if (base === undefined) {
	throw new Error("The base path is not defined!");
}

const api = new APIBuilder(base);

const baseApiGroup = "/api/auth/";

export type SignInRequest = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

export type SignInResponse = {
	success: boolean;
	message: string;
	accessToken?: string;
	expiresIn?: number;
	tokenType?: string;
	user?: { id?: string; email?: string };
	supabaseSession?: {
		accessToken: string;
		refreshToken: string;
		expiresAt: number;
	};
};

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
	return !!(
		process.env.NEXT_PUBLIC_SUPABASE_URL &&
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	);
}

/**
 * Sign in using Supabase Auth (primary method)
 * Falls back to backend auth if Supabase is not configured
 */
export async function signInWithSupabase(
	email: string,
	password: string
): Promise<SignInResponse> {
	if (!isSupabaseConfigured()) {
		// Fallback to backend auth
		return AuthAPI.signIn({ email, password, rememberMe: true });
	}

	try {
		// Sign in with Supabase
		const supabaseData = await SupabaseAuth.signIn(email, password);

		if (!supabaseData.session) {
			return {
				success: false,
				message: "Sign in failed",
			};
		}

		// Get the access token from Supabase
		const supabaseToken = supabaseData.session.access_token;

		// Validate token with ASP.NET backend and get backend-specific token
		try {
			const backendResponse = await api.post<SignInResponse>(
				baseApiGroup + "supabase-validate",
				{
					supabaseToken,
					email,
				}
			);

			if (backendResponse?.success) {
				return {
					...backendResponse,
					// Keep Supabase session info
					supabaseSession: {
						accessToken: supabaseToken,
						refreshToken: supabaseData.session.refresh_token,
						expiresAt: supabaseData.session.expires_at ?? 0,
					},
				};
			}
		} catch (backendError) {
			// Backend validation failed, but Supabase auth succeeded
			// Return success with Supabase token for local use
			console.warn(
				"Backend validation failed, using Supabase token only:",
				backendError
			);
		}

		// Return with Supabase token
		return {
			success: true,
			message: "Signed in successfully",
			accessToken: supabaseToken,
			expiresIn: supabaseData.session.expires_in,
			tokenType: supabaseData.session.token_type,
			user: {
				id: supabaseData.user?.id,
				email: supabaseData.user?.email,
			},
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Sign in failed",
		};
	}
}

/**
 * Sign out from both Supabase and backend
 */
export async function signOutAll(): Promise<void> {
	// Sign out from Supabase if configured
	if (isSupabaseConfigured()) {
		try {
			await SupabaseAuth.signOut();
		} catch (error) {
			console.warn("Supabase sign out failed:", error);
		}
	}

	// Sign out from backend
	try {
		await AuthAPI.signOut();
	} catch (error) {
		console.warn("Backend sign out failed:", error);
	}

	// Clear local storage
	try {
		localStorage.removeItem("dengue_user");
	} catch {}
}

/**
 * Refresh Supabase session
 */
export async function refreshSupabaseSession(): Promise<boolean> {
	if (!isSupabaseConfigured()) {
		return false;
	}

	try {
		const data = await SupabaseAuth.refreshSession();
		return !!data.session;
	} catch {
		return false;
	}
}

export const AuthAPI = {
	signIn: (payload: SignInRequest) =>
		api.post<SignInResponse>(baseApiGroup + "signin", payload),
	signOut: () => api.post(baseApiGroup + "signout"),
	refresh: (payload: { refreshToken: string }) =>
		api.post(baseApiGroup + "refresh", payload),
};

// Default export for backward compatibility
export default AuthAPI;

export function storeUser(user: any) {
	try {
		localStorage.setItem("dengue_user", JSON.stringify(user));
	} catch {}
}

export function getStoredUser() {
	try {
		const s = localStorage.getItem("dengue_user");
		return s ? JSON.parse(s) : null;
	} catch {
		return null;
	}
}

export function decodeJwt(token?: string) {
	if (!token) return null;
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;
		const payload = parts[1];
		const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
		return decoded;
	} catch {
		return null;
	}
}

