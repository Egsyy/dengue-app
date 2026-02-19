import React from "react";
import { Paper, Text, Badge, Group, Stack } from "@mantine/core";
import { YearlyAverageResponse } from "@/models/Statistics";
import { usePathname, useRouter } from "next/navigation";

interface YearlyAverageCardProps {
  yearlyAverageData?: YearlyAverageResponse;
  isLoading?: boolean;
}

const YearlyAverageCard: React.FC<YearlyAverageCardProps> = ({ 
  yearlyAverageData, 
  isLoading = false 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeTab = () => {
    router.push(`${pathname}?tab=charts`);
  }

  console.log("📊 YearlyAverageCard Props:", { yearlyAverageData, isLoading });

  if (isLoading) {
    return (
      <Paper
        shadow="md"
        p="md"
        withBorder
        w={'100%'}
      >
        <Text>Loading yearly average data...</Text>
      </Paper>
    );
  }

  if (yearlyAverageData?.averagePredictedCases === undefined) {
    return (
      <Paper
        shadow="md"
        p="md"
        withBorder
      >
        <Text c="dimmed">No yearly average data available</Text>
      </Paper>
    );
  }

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      w={'100%'}
      onClick={handleChangeTab}
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Group justify="space-between">
        <div>
          <Text fw={500} size="lg">
            Yearly Average - {yearlyAverageData.year}
          </Text>
        </div>
        <div>
          <Badge size="lg" variant="filled" color="blue" mb="xs">
            {yearlyAverageData.averagePredictedCases.toFixed(1)} cases/week
          </Badge>
          <Badge size="sm" variant="outline" color="orange">
            {(yearlyAverageData.averagePredictedOutbreakProbability).toFixed(1)}% outbreak risk
          </Badge>
        </div>
      </Group>
      <Text mt="xs" size="xs" c="dimmed" ta="center">
        Click to view detailed charts
      </Text>
    </Paper>
  );
};

export default YearlyAverageCard;