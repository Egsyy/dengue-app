"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthAPI, { signInWithSupabase, storeUser } from "@/libraries/api/Auth";
import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";

type Props = {};

const LoginPage = (props: Props) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const HandleTemp = async () => {
    const emailInput = (document.getElementById("email") as HTMLInputElement)?.value;
    const passwordInput = (
      document.getElementById("password") as HTMLInputElement
    )?.value;

    if (!emailInput || !passwordInput) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Use Supabase authentication
      const res = await signInWithSupabase(emailInput, passwordInput);

      if (res && res.success) {
        // Anyone who successfully signs in with Supabase is considered an admin
        // Store both tokens if available
        const userData: any = {
          email: res.user?.email || emailInput,
          // Backend access token (validated by ASP.NET)
          accessToken: res.accessToken,
        };

        // Store Supabase session info if available
        if (res.supabaseSession) {
          userData.supabaseSession = res.supabaseSession;
        }

        storeUser(userData);
        router.push("/app/");
      } else {
        // Sign-in failed - notify that only admins can sign in
        alert(res?.message || "Only admins are allowed to sign in. Please contact the administrator for access.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      alert("Only admins are allowed to sign in. Please contact the administrator for access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action="submit">
      <Stack gap="sm" pos="relative">
        <TextInput
          type="email"
          id="email"
          name="email"
          label="Email"
          placeholder="Email"
          required
          disabled={loading}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Password"
          required
          disabled={loading}
        />

        <Group justify="space-between" wrap="wrap">
          <Anchor component={Link} href="#" underline="hover" size="sm">
            Forgot password?
          </Anchor>
        </Group>

        <Button type="button" onClick={HandleTemp} mt="xs" loading={loading} fullWidth>
          Login
        </Button>

        {loading && (
          <LoadingOverlay 
            visible={loading} 
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
        )}
      </Stack>
    </form>
  );
};

export default LoginPage;
