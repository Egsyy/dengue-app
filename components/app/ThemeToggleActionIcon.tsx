"use client";

import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ThemeToggleActionIcon() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder with the same dimensions during SSR
  if (!mounted) {
    return (
      <ActionIcon variant="subtle" size="lg" aria-label="Toggle theme">
        <IconSun size={18} />
      </ActionIcon>
    );
  }

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={() => toggleColorScheme()}
      aria-label="Toggle theme"
    >
      {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
