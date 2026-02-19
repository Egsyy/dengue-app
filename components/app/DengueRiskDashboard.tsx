import React, { useEffect, useState } from "react";
import { useCalendarContext } from "@/libraries/contexts/CalendarContext";
import { useBarangaySelectionStore } from "@/libraries/stores/useBarangaySelectionStore";
import { format, subWeeks, addWeeks } from "date-fns";
import {
  useDengueRiskAssessment,
  useBatchRiskAssessment,
  useRiskAnalytics,
} from "@/libraries/hooks/useDengueRiskAssessment";
import { RiskLevel } from "@/libraries/risk-assessment/DengueRiskAssessment";
import RiskAssessmentCard from "./RiskAssessmentCard";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Progress,
  Slider,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface DengueRiskDashboardProps {
  showTrendAnalysis?: boolean;
  showBatchComparison?: boolean;
  showAnalytics?: boolean;
}

const DengueRiskDashboard: React.FC<DengueRiskDashboardProps> = ({
  showTrendAnalysis = true,
  showBatchComparison = false,
  showAnalytics = false,
}) => {
  const { getWeekDateRangeString } = useCalendarContext();
  const { SelectedBarangay } = useBarangaySelectionStore();

  // Individual risk assessment
  const {
    riskResult,
    isLoading,
    error,
    refetch,
    riskTrend,
    isTrendLoading,
    fetchRiskTrend,
    quickAssess,
  } = useDengueRiskAssessment({
    psgccode: SelectedBarangay?.PsgcCode,
    selectedDate: getWeekDateRangeString()?.split(" ")[0],
    enableCache: true,
    includeHistoricalContext: true,
    autoRefresh: false,
  });

  // Batch assessment for comparison
  const {
    results: batchResults,
    isLoading: isBatchLoading,
    error: batchError,
    assessMultiple,
    clearResults,
  } = useBatchRiskAssessment();

  // Analytics
  const { analytics, calculateAnalytics, clearAnalytics } = useRiskAnalytics();

  // Local state for demo data
  const [demoValue, setDemoValue] = useState<number>(50);
  const [showDemo, setShowDemo] = useState<boolean>(false);

  // Fetch trend data when component mounts
  useEffect(() => {
    if (showTrendAnalysis && SelectedBarangay?.PsgcCode) {
      const startDate = format(subWeeks(new Date(), 8), "yyyy-MM-dd");
      const endDate = format(addWeeks(new Date(), 4), "yyyy-MM-dd");
      fetchRiskTrend(startDate, endDate);
    }
  }, [SelectedBarangay?.PsgcCode, showTrendAnalysis, fetchRiskTrend]);

  // Calculate analytics when batch results are available
  useEffect(() => {
    if (showAnalytics && batchResults.length > 0) {
      const validResults = batchResults
        .filter((item) => item.result !== null)
        .map((item) => item.result!);

      if (validResults.length > 0) {
        calculateAnalytics(validResults);
      }
    }
  }, [batchResults, showAnalytics, calculateAnalytics]);

  // Handle demo assessment
  const handleDemoAssessment = () => {
    if (showDemo) {
      setShowDemo(false);
    } else {
      setShowDemo(true);
    }
  };

  // Get risk level color for badges
  const getRiskBadgeColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return "green";
      case RiskLevel.MODERATE:
        return "yellow";
      case RiskLevel.HIGH:
        return "red";
      case RiskLevel.CRITICAL:
        return "red";
      default:
        return "gray";
    }
  };

  // Get progress color
  const getProgressColor = (level: string) => {
    switch (level) {
      case RiskLevel.LOW:
        return "green";
      case RiskLevel.MODERATE:
        return "yellow";
      default:
        return "red";
    }
  };

  // Handle batch assessment demo
  const handleBatchAssessment = () => {
    // Sample barangay data for demonstration
    const sampleBarangayData = [
      {
        psgccode: "0931700001",
        selectedDate: format(new Date(), "yyyy-MM-dd"),
      },
      {
        psgccode: "0931700002",
        selectedDate: format(new Date(), "yyyy-MM-dd"),
      },
      {
        psgccode: "0931700003",
        selectedDate: format(new Date(), "yyyy-MM-dd"),
      },
    ];

    assessMultiple(sampleBarangayData);
  };

  return (
    <Stack gap="lg" w="100%">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Title order={2}>Dengue Risk Assessment Dashboard</Title>
        <Group gap="sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            leftSection={
              isLoading ? <Loader size="xs" /> : <IconRefresh size={16} />
            }
          >
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleDemoAssessment}>
            {showDemo ? "Hide Demo" : "Show Demo"}
          </Button>
        </Group>
      </Group>

      {/* Error Display */}
      {(error || batchError) && (
        <Alert
          variant="light"
          color="red"
          icon={<IconAlertCircle size={16} />}
          title="Error"
        >
          {error || batchError}
        </Alert>
      )}

      {/* Main Risk Assessment */}
      {riskResult && (
        <RiskAssessmentCard
          riskResult={riskResult}
          barangayName={SelectedBarangay?.Name}
          showDetails={true}
          showSuggestions={true}
        />
      )}

      {/* Loading State */}
      {isLoading && !riskResult && (
        <Group justify="center" align="center" h={256}>
          <Loader size="lg" />
        </Group>
      )}

      {/* Demo Section */}
      {showDemo && (
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Risk Assessment Demo
          </Title>

          <Stack gap="md">
            <div>
              <Text size="sm" mb="xs">
                Prediction Value (0-100)
              </Text>
              <Slider
                min={0}
                max={100}
                value={demoValue}
                onChange={setDemoValue}
                marks={[
                  { value: 0, label: "0" },
                  { value: 25, label: "25" },
                  { value: 50, label: "50" },
                  { value: 75, label: "75" },
                  { value: 100, label: "100" },
                ]}
              />
              <Text ta="center" mt="md" size="lg" fw={700}>
                {demoValue}%
              </Text>
            </div>

            <Divider />

            <RiskAssessmentCard
              riskResult={quickAssess(demoValue)}
              barangayName="Demo Barangay"
              showDetails={true}
              showSuggestions={false}
            />
          </Stack>
        </Card>
      )}

      {/* Trend Analysis */}
      {showTrendAnalysis && riskTrend && (
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Risk Trend Analysis
          </Title>

          {isTrendLoading ? (
            <Group justify="center" align="center" h={128}>
              <Loader size="md" />
            </Group>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Risk Level</Table.Th>
                  <Table.Th>Trend</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {riskTrend.slice(-8).map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      {format(new Date(item.date), "MMM dd, yyyy")}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getRiskBadgeColor(item.riskLevel as RiskLevel)}
                      >
                        {item.riskLevel}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          item.trend === "improving"
                            ? "green"
                            : item.trend === "worsening"
                              ? "red"
                              : "gray"
                        }
                      >
                        {item.trend}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Batch Comparison */}
      {showBatchComparison && (
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center" mb="md">
            <Title order={4}>Barangay Comparison</Title>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchAssessment}
              disabled={isBatchLoading}
              leftSection={isBatchLoading ? <Loader size="xs" /> : null}
            >
              Assess Multiple
            </Button>
          </Group>

          {batchResults.length > 0 ? (
            <Grid>
              {batchResults.map((item, index) => (
                <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      Barangay {item.psgccode}
                    </Text>
                    <Text
                      size="xl"
                      fw={700}
                      c={
                        item.result
                          ? getRiskBadgeColor(item.result.riskLevel)
                          : "gray"
                      }
                    >
                      {item.result ? `${item.result.riskPercentage}%` : "N/A"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.result ? item.result.riskLevel : "No data"}
                    </Text>
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              Click "Assess Multiple" to compare risk levels across barangays
            </Text>
          )}
        </Card>
      )}

      {/* Analytics */}
      {showAnalytics && analytics && (
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Risk Analytics
          </Title>

          <Grid mb="md">
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Total Assessments
                </Text>
                <Text size="xl" fw={700}>
                  {analytics.totalAssessments}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, md: 3 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Average Risk Score
                </Text>
                <Text size="xl" fw={700}>
                  {analytics.averageRiskScore.toFixed(1)}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, md: 3 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  High Risk Areas
                </Text>
                <Text size="xl" fw={700}>
                  {analytics.highRiskAreas.length}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 6, md: 3 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Critical Risk
                </Text>
                <Text size="xl" fw={700} c="red">
                  {analytics.riskLevelDistribution[RiskLevel.CRITICAL] || 0}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          <div>
            <Text fw={600} mb="sm">
              Risk Level Distribution
            </Text>
            <Stack gap="sm">
              {Object.entries(analytics.riskLevelDistribution).map(
                ([level, count]) => (
                  <Group key={level} justify="space-between" align="center">
                    <Text tt="capitalize">{level}</Text>
                    <Group gap="sm" align="center">
                      <Progress
                        value={(count / analytics.totalAssessments) * 100}
                        color={getProgressColor(level)}
                        size="sm"
                        w={128}
                      />
                      <Text size="sm">{count}</Text>
                    </Group>
                  </Group>
                ),
              )}
            </Stack>
          </div>
        </Card>
      )}
    </Stack>
  );
};

export default DengueRiskDashboard;
