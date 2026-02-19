"use client";
import React from "react";
import MainContent from "./MainContent";
import { HistoricalDengueCases } from "@/libraries/api/HistoricalDengueAPI";
import useSWR from "swr";
import HistoricalCasesChart from "./HistoricalCasesChart";
import { SampleData } from "@/data/DengueProbability";
import {
  Alert,
  Center,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

type Props = {};

const HomePage = () => {
  const {
    data: historicalData,
    error,
    isLoading,
  } = useSWR("HistoricalDengue", () =>
    HistoricalDengueCases.getYearlyHistorical(),
  );

  // Add this debugging
  // console.log("SWR State:", { historicalData, error, isLoading });
  // console.log("Data structure:", historicalData);
  // console.log("TotalDengueCases:", historicalData?.recorded_cases);

  if (error)
    return (
      <Container size="xl" py="md">
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertCircle size={16} />}
          title="Error"
        >
          Error loading dengue data
        </Alert>
      </Container>
    );

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Paper p="md" radius="md" withBorder>
          <MainContent />
        </Paper>

        {isLoading && (
          <Center>
            <Loader color="gray" size="xl" type="dots" />
          </Center>
        )}

        {historicalData !== undefined && (
          <HistoricalCasesChart data={historicalData} height={400} showTrend />
        )}
      </Stack>
    </Container>
  );
};

export default HomePage;
