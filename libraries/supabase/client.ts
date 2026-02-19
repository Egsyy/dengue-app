import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase configuration for Dengue Watch application
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * - NEXT_PUBLIC_SUPABASE_JWT_SECRET: JWT secret for backend validation (optional)
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  jwtSecret?: string;
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET;

  if (!url || !anonKey) {
    console.warn(
      "Supabase environment variables are not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return {
    url: url || "",
    anonKey: anonKey || "",
    jwtSecret,
  };
}

const config = getSupabaseConfig();

/**
 * Create a Supabase client for browser usage
 * This client handles authentication and data fetching
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    config.url,
    config.anonKey
  );
}

/**
 * Supabase authentication helper functions
 */
export const SupabaseAuth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  },

  /**
   * Get the current user
   */
  getUser: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  },

  /**
   * Refresh the current session
   */
  refreshSession: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Get the access token from the current session
   */
  getAccessToken: async (): Promise<string | null> => {
    try {
      const session = await SupabaseAuth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  },
};

export default SupabaseAuth;
