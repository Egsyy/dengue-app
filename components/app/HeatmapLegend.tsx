"use client";

import { Group, Badge, Text, Stack, Paper } from "@mantine/core";

const LEGEND_ITEMS = [
  { label: "Low", lightColor: "#51cf66", darkColor: "#69db7c" },
  { label: "Medium", lightColor: "#fcc419", darkColor: "#ffd43b" },
  { label: "High", lightColor: "#f76707", darkColor: "#ff922b" },
  { label: "Critical", lightColor: "#e03131", darkColor: "#ff6b6b" },
] as const;

type HeatmapLegendProps = {
  theme: "light" | "dark";
};

export default function HeatmapLegend({ theme }: HeatmapLegendProps) {
  return (
    <Paper p="xs" radius="md" withBorder>
      <Stack gap={4}>
        <Text size="xs" fw={600} c="dimmed">
          Risk Level
        </Text>
        <Group gap="xs" wrap="wrap">
          {LEGEND_ITEMS.map((item) => (
            <Badge
              key={item.label}
              size="sm"
              variant="dot"
              color={theme === "dark" ? item.darkColor : item.lightColor}
              styles={{
                root: {
                  textTransform: "none",
                },
              }}
            >
              {item.label}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}
