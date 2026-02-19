"use client";

import React, { useEffect, useState } from "react";
import { useCalendarContext } from "@/libraries/contexts/CalendarContext";
import { redirect, useRouter } from "next/navigation";
import { useBarangaySelectionStore } from "@/libraries/stores/useBarangaySelectionStore";
import { format } from "date-fns";
import {
  quickRiskAssessment,
  RiskAssessmentResult,
} from "@/libraries/risk-assessment";
import RiskAssessmentCard from "@/components/app/RiskAssessmentCard";
import YearlyAverageCard from "@/components/app/YearlyAverageCard";
import useSWR from "swr";
import { PredictedDengueCase } from "@/models/PredictedDengueCase";
import { DengueCasesAPI } from "@/libraries/api/DengueAPI";
import AdvisoriesAPI, { CommunityAdvisory, RiskLevel } from "@/libraries/api/AdvisoriesAPI";
import { YearlyAverageResponse } from "@/models/Statistics";
import { ApiError } from "@/libraries/api/Client";
import useSWRMutation from "swr/mutation";
import { Loader, Stack, Text, Title, Center, Paper, Group, Badge, Alert, Card } from "@mantine/core";

const InformationTab = () => {
  // Check hydration first before any hooks
  const {
    _hasHydrated: hasHydrated,
    selectedDateISO,
    getWeekDateRange,
    getWeekDateRangeString,
    getStringDate: stringDate,
    isoYear,
  } = useCalendarContext();

  const router = useRouter();

  const { SelectedBarangay } = useBarangaySelectionStore();
  const [riskResult, setRiskResult] = useState<RiskAssessmentResult | null>(
    null,
  );

  // Get current year from selected date
  const currentYear = isoYear;



  if (getWeekDateRange() == null) redirect("/app/calendar");

  const { trigger } = useSWRMutation("retry-on-error-fetch", () =>
    DengueCasesAPI.predictDengueCase(SelectedBarangay!.PsgcCode, stringDate),
  );

  const { data, isLoading, error, mutate } = useSWR<
    PredictedDengueCase,
    ApiError
  >(
    SelectedBarangay !== null && stringDate
      ? `predicted-case-${SelectedBarangay.PsgcCode}-${stringDate}`
      : null,
    () =>
      DengueCasesAPI.getOneWeekPrediction(
        SelectedBarangay!.PsgcCode,
        stringDate,
      ),
  );

  // Fetch yearly average data
  const { data: yearlyAverageData, isLoading: isYearlyLoading } = useSWR<
    YearlyAverageResponse,
    ApiError
  >(
    SelectedBarangay !== null && currentYear
      ? `yearly-average-${SelectedBarangay.PsgcCode}-${currentYear}`
      : null,
    () =>
      DengueCasesAPI.getYearlyAverage(
        SelectedBarangay!.PsgcCode,
        currentYear!
      ),
  );

  // Function to convert RiskLevel from DengueRiskAssessment to AdvisoriesAPI format
  const convertRiskLevel = (riskLevel: any): RiskLevel => {
    switch (riskLevel) {
      case "low":
        return "Low";
      case "moderate":
        return "Medium";
      case "high":
        return "High";
      case "critical":
        return "Critical";
      default:
        return "Low";
    }
  };

  // Fetch all advisories (preventive measurements)
  const { data: advisoriesData, isLoading: isAdvisoriesLoading } = useSWR(
    `advisories-all`,
    () => AdvisoriesAPI.getAllAdvisories(),
  );

  // Handle 404 error separately
  useEffect(() => {
    if (error?.status === 404) {
      trigger();
      mutate();
    }
  }, [error?.status, trigger, mutate]);

  // Update riskResult when data changes
  useEffect(() => {
    if (
      data &&
      data.outbreak_probability !== undefined &&
      data.outbreak_probability !== null
    ) {
      setRiskResult(quickRiskAssessment(data.outbreak_probability));
    } else {
      setRiskResult(null);
    }
  }, [data]);

  // Reset when barangay or date changes
  useEffect(() => {
    setRiskResult(null);
  }, [SelectedBarangay, stringDate]);
  
  // Show loader while hydrating
  if (!hasHydrated) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const dates = getWeekDateRangeString().split(" ");
  
  return (
    <Stack gap="md" align="center">
      <Title order={3} ta="center">
        {SelectedBarangay?.Name ?? "Please Select a Barangay"}
      </Title>

      <Text size="sm" c="dimmed" ta="center">
        {format(dates[0], "MMM. dd, yyyy")} -{" "}
        {format(dates[6], "MMM. dd, yyyy")}
      </Text>

      {error?.status == 404 && (
        <Text c="red" ta="center">
          Data Not Found. Wait while we try generating prediction. If not try
          other sometime.
        </Text>
      )}

      {/* Yearly Average Card */}
      <YearlyAverageCard
        yearlyAverageData={yearlyAverageData}
        isLoading={isYearlyLoading}
      />

      {!isLoading && riskResult !== null ? (
        <>
          <RiskAssessmentCard
            riskResult={riskResult}
            barangayName={SelectedBarangay?.Name}
            showDetails={true}
            showSuggestions={false}
          />
          
          {/* Preventive Measurements Section */}
          {!isAdvisoriesLoading && advisoriesData && advisoriesData.length > 0 ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text fw={600} size="lg" mb="md">
                Preventive Measurements
              </Text>
              <Stack gap="xs">
                {advisoriesData.filter(item => item.isActive === true && item.riskLevel === convertRiskLevel(riskResult.riskLevel)).map((advisory: CommunityAdvisory) => (
                  <Text key={advisory.id} size="xs">- {advisory.actionPlan}</Text>
                ))}
              </Stack>
            </Card>
          ) : !isAdvisoriesLoading && (
            <Alert variant="light" color="yellow" title="No Preventive Measurements">
              There are currently no preventive measurements available. Please check back later.
            </Alert>
          )}
        </>
      ) : (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      )}
    </Stack>
  );
};

export default InformationTab;
