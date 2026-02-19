"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Select, Stack, Text, Paper, Tabs } from "@mantine/core";
import { IconChartBar, IconInfoCircle } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import ChartsTab from "./ChartsTab";
import InformationTab from "./InformationTab";
import { useBarangaySelectionStore } from "@/libraries/stores/useBarangaySelectionStore";
import { useBarangaysStore } from "@/libraries/stores/useBarangaysStore";

type Props = {};

const DashboardPage = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const municipalityPsgcCode = "0931700000";

  const [activeTab, setActiveTab] = useState<string>("information");

  useEffect(() => {
    // read from browser URL on client only to avoid pre-render bailout
    try {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(search);
      const tab = params.get("tab") || "information";
      setActiveTab(tab);
    } catch (e) {
      // ignore
    }
  }, []);

  const { SelectedBarangay, SelectBarangay, ClearSelection } =
    useBarangaySelectionStore();
  const { getBarangays, fetchBarangays, isLoading, error } =
    useBarangaysStore();

  useEffect(() => {
    fetchBarangays(municipalityPsgcCode);
  }, [fetchBarangays, municipalityPsgcCode]);

  const barangays = getBarangays(municipalityPsgcCode);

  const selectData = useMemo(
    () =>
      barangays.map((b) => ({
        value: b.psgcCode,
        label: b.name,
      })),
    [barangays],
  );

  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
      // Update URL with new tab without full reload
      router.push(`${pathname}?tab=${value}`);
    }
  };

  return (
    <Paper p="md" radius="md" shadow="sm">
      <Stack gap="md">
        <Select
          label="Barangay"
          placeholder={isLoading ? "Loading barangays..." : "Select barangay"}
          data={selectData}
          value={SelectedBarangay?.PsgcCode ?? null}
          searchable
          clearable
          onClear={ClearSelection}
          onChange={(value) => {
            if (!value) {
              ClearSelection();
              return;
            }
            const selected = barangays.find((b) => b.psgcCode === value);
            SelectBarangay(selected?.name ?? value, value);
          }}
          disabled={isLoading}
          nothingFoundMessage="No barangays found"
          w={320}
        />
        {error && (
          <Text c="red.6" size="sm">
            Failed to load barangays
          </Text>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} variant="outline">
          <Tabs.List>
            <Tabs.Tab
              value="information"
              leftSection={<IconInfoCircle size={16} />}
            >
              Information
            </Tabs.Tab>
            <Tabs.Tab value="charts" leftSection={<IconChartBar size={16} />}>
              Charts
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="information" pt="md">
            <Paper p="lg" withBorder>
              <InformationTab />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="charts" pt="md">
            <Paper p="lg" withBorder>
              <ChartsTab />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
};

export default DashboardPage;
