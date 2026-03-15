"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { HeatmapAPI } from "@/libraries/api/HeatmapAPI";
import {
  Alert,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconAlertCircle, IconMapPin } from "@tabler/icons-react";
import HeatmapLegend from "@/components/app/HeatmapLegend";
import { useState } from "react";

// Dynamically import the heatmap to avoid SSR issues with Leaflet
const DengueHeatmap = dynamic(
  () => import("@/components/app/DengueHeatmap"),
  {
    ssr: false,
    loading: () => (
      <Center h={500}>
        <Loader color="teal" size="lg" type="dots" />
      </Center>
    ),
  }
);

export default function HeatmapSection() {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );

  const yearOptions = Array.from({ length: currentYear - 2014 + 1 }, (_, i) =>
    (2014 + i).toString()
  ).reverse();

  const {
    data: heatmapData,
    error,
    isLoading,
  } = useSWR(
    `heatmap-${selectedYear}`,
    () => HeatmapAPI.getHeatmapData(parseInt(selectedYear)),
    { revalidateOnFocus: false }
  );

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs">
            <IconMapPin size={20} />
            <Title order={4}>Dengue Risk Heatmap</Title>
          </Group>
          <Group gap="sm">
            <Select
              size="xs"
              w={100}
              value={selectedYear}
              onChange={(val) => val && setSelectedYear(val)}
              data={yearOptions}
              allowDeselect={false}
            />
            <HeatmapLegend theme={theme} />
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          Heatmap of dengue cases across all barangays. Warmer colors indicate
          higher risk areas.
        </Text>

        {error && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertCircle size={16} />}
            title="Error"
          >
            Failed to load heatmap data. Please try again later.
          </Alert>
        )}

        {isLoading && (
          <Center h={500}>
            <Loader color="teal" size="lg" type="dots" />
          </Center>
        )}

        {heatmapData && heatmapData.length > 0 && (
          <DengueHeatmap data={heatmapData} height={500} />
        )}

        {heatmapData && heatmapData.length === 0 && (
          <Center h={300}>
            <Text c="dimmed" size="sm">
              No heatmap data available for {selectedYear}.
            </Text>
          </Center>
        )}
      </Stack>
    </Paper>
  );
}
