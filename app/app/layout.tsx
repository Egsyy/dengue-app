"use client";
import React, { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { CalendarProvider } from "@/libraries/contexts/CalendarContext";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ActionIcon,
  Box,
  useComputedColorScheme,
  useMantineTheme,
  Menu,
  Avatar,
  UnstyledButton,
} from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggleActionIcon } from "@/components/app/ThemeToggleActionIcon";
import AuthAPI, { getStoredUser, storeUser, signOutAll } from "@/libraries/api/Auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(false);
  const pathname = usePathname();
  const router = useRouter();
  const theme = useMantineTheme();

  // Avoid SSR/CSR mismatch when user has a persisted scheme in localStorage.
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = computedColorScheme === "dark";

  const navItems = [
    { href: "/app/home", label: "Home", icon: "🏠" },
    { href: "/app/prediction", label: "Prediction", icon: "📊" },
  ];

  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkAuthentication = () => {
      try {
        // Use the utility function from Auth.ts to get stored user
        const userData = getStoredUser();
        
        if (!userData) {
          setUser(null);
          setIsAdmin(false);
          return;
        }
        
        setUser(userData);
        
        // ADMIN ACCESS LOGIC: Any authenticated user with a valid token is considered an admin
        // This checks for either direct accessToken or Supabase session token
        const hasValidToken = userData.accessToken !== undefined && userData.accessToken !== null && userData.accessToken !== "";
        
        setIsAdmin(hasValidToken);
      
        // If user has no valid token, redirect to sign-in
        if (!hasValidToken && pathname !== "/auth/signin") {
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        setIsAdmin(false);
        // Redirect to sign-in if authentication check fails and not already on sign-in page
        if (pathname !== "/auth/signin") {
          router.push("/auth/signin");
        }
      }
    };
    
    checkAuthentication();
  }, [mounted, pathname, router]);

  const headerBg = mounted ? (isDark ? theme.colors.dark[7] : theme.white) : undefined;
  const navbarBg = mounted ? (isDark ? theme.colors.dark[8] : theme.white) : undefined;

  const handleSignOut = async () => {
    try {
      // Use the comprehensive sign out function from Auth.ts
      await signOutAll();
    } catch (error) {
      console.error("Sign out failed:", error);
      // Fallback to local cleanup
      try {
        localStorage.removeItem("dengue_user");
      } catch {}
    }
    setUser(null);
    setIsAdmin(false);
    router.push("/app/home");
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header
        style={
          headerBg
            ? {
                backgroundColor: headerBg,
                borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
              }
            : undefined
        }
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm" align="center">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
            <img
              src="/logo/mosquito.svg"
              alt="Dengue Watch"
              style={{ height: 36, cursor: "pointer" }}
              onClick={() => router.push("/app/home")}
            />
          </Group>

          <Group gap="xs" align="center">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => router.push("/app/calendar")}
              aria-label="Calendar"
              title="Calendar"
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </ActionIcon>

            <Menu>
              <Menu.Target>
                <UnstyledButton aria-label="Profile">
                  <Group gap={8} align="center">
                    <Avatar size={30} src={user?.avatar} alt={user?.email} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user?.email ?? "Guest"}</Menu.Label>
                {user ? (
                  <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
                ) : (
                  <Menu.Item onClick={() => router.push("/auth/signin")}>Sign in</Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>

            <ThemeToggleActionIcon />
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar / Sidebar */}
      <AppShell.Navbar
        p="md"
        style={
          navbarBg
            ? {
                backgroundColor: navbarBg,
                borderRight: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
              }
            : undefined
        }
      >
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            leftSection={<span>{item.icon}</span>}
            active={pathname?.startsWith(item.href)}
            onClick={(e) => {
              e.preventDefault();
              router.push(item.href);
              if (opened) toggle();
            }}
            style={{ marginBottom: theme.spacing.xs }}
          />
        ))}

        {/* Admin link - visible to any authenticated user with a valid token */}
        {isAdmin && (
          <NavLink
            key="/app/admin"
            href="/app/admin"
            label="Admin"
            leftSection={<span>⚙️</span>}
            active={pathname?.startsWith("/app/admin")}
            onClick={(e) => {
              e.preventDefault();
              router.push("/app/admin");
              if (opened) toggle();
            }}
            style={{ marginBottom: theme.spacing.xs }}
          />
        )}
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Box mih="100%" bg={isDark ? "dark.9" : "gray.0"}>
          <CalendarProvider>{children}</CalendarProvider>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
