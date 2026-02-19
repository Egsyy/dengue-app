import React from "react";
import {
  DengueRiskAssessment,
  RiskAssessmentResult,
  RiskLevel,
  getRiskLevelText,
  getAlertMessage,
} from "@/libraries/risk-assessment/DengueRiskAssessment";
import {
  Alert,
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  List,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconShieldCheck,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

interface RiskAssessmentCardProps {
  riskResult: RiskAssessmentResult;
  barangayName?: string;
  showDetails?: boolean;
  showSuggestions?: boolean;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  riskResult,
  barangayName,
  showDetails = true,
  showSuggestions = true,
}) => {
  const {
    riskLevel,
    riskPercentage,
    config,
    suggestions,
    preventiveMeasures,
    urgencyLevel,
  } = riskResult;

  // Get Mantine alert color based on risk level
  const getAlertColor = () => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return "green";
      case RiskLevel.MODERATE:
        return "yellow";
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL:
        return "red";
      default:
        return "blue";
    }
  };

  // Get alert icon based on risk level
  const getAlertIcon = () => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return <IconShieldCheck size={24} />;
      case RiskLevel.MODERATE:
        return <IconAlertCircle size={24} />;
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL:
        return <IconAlertTriangle size={24} />;
      default:
        return <IconInfoCircle size={24} />;
    }
  };

  // Get urgency badge color
  const getUrgencyBadgeColor = () => {
    switch (urgencyLevel) {
      case "low":
        return "green";
      case "medium":
        return "yellow";
      case "high":
        return "red";
      case "critical":
        return "red";
      default:
        return "blue";
    }
  };

  // Get ring progress color
  const getRingColor = () => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return "green";
      case RiskLevel.MODERATE:
        return "yellow";
      case RiskLevel.HIGH:
        return "orange";
      case RiskLevel.CRITICAL:
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <Stack gap="md" w="100%">
      {/* Risk Level Display */}
      <Alert
        variant="light"
        color={getAlertColor()}
        icon={getAlertIcon()}
        title={
          <Group justify="space-between" wrap="wrap">
            <Text fw={700} size="lg">
              {getRiskLevelText(riskLevel)}
            </Text>
            <Badge
              color={getUrgencyBadgeColor()}
              size={urgencyLevel === "critical" ? "lg" : "md"}
              variant="filled"
              tt="uppercase"
            >
              {urgencyLevel} urgency
            </Badge>
          </Group>
        }
      >
        <Text size="sm">{getAlertMessage(riskLevel, barangayName)}</Text>
      </Alert>

      {/* Risk Visualization */}
      <Card shadow="md" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Risk Assessment
        </Title>

        {/* Progress Ring */}
        <Stack align="center" gap="sm">
          <RingProgress
            size={200}
            thickness={16}
            roundCaps
            sections={[
              {
                value: DengueRiskAssessment.getProgressValue(riskPercentage),
                color: getRingColor(),
              },
            ]}
            label={
              <Text ta="center" fw={700} size="xl">
                {riskPercentage.toFixed(2)}%
              </Text>
            }
          />
          <Text size="sm" c="dimmed">
            Probability of Dengue Transmission
          </Text>
        </Stack>

        {showDetails && (
          <>
            <Divider my="md" label="Details" labelPosition="center" />

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Risk Level
                  </Text>
                  <Text size="xl" fw={700} c={getRingColor()}>
                    {getRiskLevelText(riskLevel)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {config.description}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Risk Score
                  </Text>
                  <Text size="xl" fw={700} c={getRingColor()}>
                    {riskResult.riskScore.toFixed(2)}/100
                  </Text>
                  <Text size="xs" c="dimmed">
                    Adjusted risk score
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Card>

      {/* Suggestions */}
      {showSuggestions && (
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Recommended Actions
          </Title>

          <Stack gap="md">
            <div>
              <Text fw={600} c="dimmed" mb="sm">
                Immediate Actions
              </Text>
              <List size="sm" spacing="xs">
                {suggestions.map((suggestion, index) => (
                  <List.Item key={index}>{suggestion}</List.Item>
                ))}
              </List>
            </div>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default RiskAssessmentCard;
