"use client";
import Landing from "@/app/landing";
import AboutUs from "./about-us";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/libraries/SmoothScroll";
import {
  Group,
  Image,
  Text,
  Anchor,
  Box,
  Container,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { ThemeToggleActionIcon } from "@/components/app/ThemeToggleActionIcon";

export default function Home() {
  useSmoothScroll();

  const [isScrolled, setIsScrolled] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const theme = useMantineTheme();
  // Avoid SSR/CSR mismatch when user has a persisted scheme in localStorage.
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  // Only use dark mode styles after mounting to prevent hydration mismatch
  const isDark = mounted && computedColorScheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Avoid rendering dynamic Date-derived content during SSR.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box>
      {/* Sticky Header */}
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          borderBottom: `1px solid ${
            isDark ? theme.colors.dark[4] : theme.colors.gray[2]
          }`,
          transition: "box-shadow 0.3s ease",
          boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <Container size="xl">
          <Group h={64} justify="space-between">
            <Group gap="xs">
              <Image
                src="/logo/mosquito.svg"
                alt="Dengue App Logo"
                h={40}
                w="auto"
                fit="contain"
              />
              <Text size="lg" fw={600} c={isDark ? "gray.0" : "dark"}>
                Dengue App
              </Text>
            </Group>

            <Group component="nav" gap="md">
              <Anchor
                href="#landing"
                c={isDark ? "gray.0" : "dark"}
                underline="never"
                fw={500}
              >
                Home
              </Anchor>
              <Anchor
                href="#about-us"
                c={isDark ? "gray.0" : "dark"}
                underline="never"
                fw={500}
              >
                About Us
              </Anchor>
              <ThemeToggleActionIcon />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Landing />
      <AboutUs />

      {/* Footer */}
      <Box component="footer" py="xl" bg="gray.1">
        <Container size="xl">
          <Text ta="center" c="dimmed" size="sm">
            © {year ?? ""} Dengue App. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
