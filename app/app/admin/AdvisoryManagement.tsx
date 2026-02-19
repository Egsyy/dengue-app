"use client";

import React, { useState } from "react";
import { Card, Button, Text, Group, TextInput, Stack, Select, Alert, Switch, Modal, Badge, ScrollArea, SimpleGrid, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import useSWR from "swr";
import { showNotification } from "@mantine/notifications";
import AdvisoriesAPI, { CommunityAdvisory } from "@/libraries/api/AdvisoriesAPI";

interface Advisory {
  id?: string;
  title: string;
  description: string;
  actionPlan: string;
  riskLevel: string;
  isActive: boolean;
}

interface AdvisoryManagementProps {
  onAdvisoryCreated?: () => void;
}

export const AdvisoryManagement: React.FC<AdvisoryManagementProps> = ({ onAdvisoryCreated }) => {
  const [advisory, setAdvisory] = useState<Advisory>({
    title: "",
    description: "",
    actionPlan: "",
    riskLevel: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdvisory, setSelectedAdvisory] = useState<Advisory | null>(null);

  const riskLevels = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  const isSmall = useMediaQuery("(max-width: 768px)");

  const handleInputChange = (field: keyof Advisory, value: string | boolean) => {
    setAdvisory(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!advisory.title || !advisory.description || !advisory.actionPlan || !advisory.riskLevel) {
      showNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      await AdvisoriesAPI.createAdvisory({
        title: advisory.title,
        description: advisory.description,
        actionPlan: advisory.actionPlan,
        riskLevel: advisory.riskLevel as any,
      });

      showNotification({
        title: "Success",
        message: "Advisory created successfully",
        color: "green",
      });

      // Reset form
      setAdvisory({
        title: "",
        description: "",
        actionPlan: "",
        riskLevel: "",
        isActive: true,
      });

      if (onAdvisoryCreated) {
        onAdvisoryCreated();
      }
      // Refresh advisory list
      mutate();
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to create advisory",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all advisories to list them
  const { data: advisoriesData, mutate } = useSWR<CommunityAdvisory[]>(
    "admin-advisories-all",
    () => AdvisoriesAPI.getAllAdvisories(),
  );

  const handleCardClick = (adv: any) => {
    setSelectedAdvisory({
      id: adv.id?.toString(),
      title: adv.title,
      description: adv.description,
      actionPlan: adv.actionPlan,
      riskLevel: adv.riskLevel,
      isActive: adv.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAdvisory || !selectedAdvisory.id) return;
    setLoading(true);
    try {
      await AdvisoriesAPI.updateAdvisory(selectedAdvisory.id, {
        title: selectedAdvisory.title,
        description: selectedAdvisory.description,
        actionPlan: selectedAdvisory.actionPlan,
        riskLevel: selectedAdvisory.riskLevel as any,
        isActive: selectedAdvisory.isActive,
      });

      showNotification({
        title: "Success",
        message: "Advisory updated successfully",
        color: "green",
      });

      setIsModalOpen(false);
      setSelectedAdvisory(null);
      if (onAdvisoryCreated) onAdvisoryCreated();
      mutate();
    } catch (err) {
      showNotification({
        title: "Error",
        message: "Failed to update advisory",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (adv: CommunityAdvisory) => {
    try {
      await AdvisoriesAPI.updateAdvisory(adv.id, { isActive: !adv.isActive });
      mutate();
      showNotification({ title: "Updated", message: `${adv.title} active status updated`, color: "green" });
    } catch (e) {
      showNotification({ title: "Error", message: "Failed to update status", color: "red" });
    }
  };

  // Group advisories by risk level and sort by title then isActive
  const grouped: Record<string, CommunityAdvisory[]> = {};
  if (advisoriesData && advisoriesData.length > 0) {
    advisoriesData.forEach((a) => {
      if (!grouped[a.riskLevel]) grouped[a.riskLevel] = [];
      grouped[a.riskLevel].push(a);
    });

    Object.keys(grouped).forEach((k) => {
      grouped[k].sort((x, y) => {
        const nameComp = x.title.localeCompare(y.title);
        if (nameComp !== 0) return nameComp;
        return (y.isActive === x.isActive) ? 0 : (y.isActive ? 1 : -1);
      });
    });
  }

  return (
    <Card shadow="sm" padding="md">
      <Text size="lg" fw={700} mb="md">
        Community Preventive Advisories
      </Text>

      <Alert variant="light" color="blue" title="Disclaimer">
        <Text size="sm">
          Create advisories to inform users about dengue risk levels. These advisories will be displayed 
          in the Information Tab based on the current risk level assessment. Make sure to provide 
          clear and actionable information.
        </Text>
      </Alert>

      <SimpleGrid cols={isSmall ? 1 : 2} spacing="lg" mt="md">
        {/* Left: Create form */}
        <Box>
          <Card withBorder>
            <Text size="md" fw={700} mb="sm">Create Advisory</Text>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="Enter advisory title"
                value={advisory.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />

              <TextInput
                label="Description"
                placeholder="Enter advisory description"
                value={advisory.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />

              <TextInput
                label="Action Plan"
                placeholder="Enter action plan"
                value={advisory.actionPlan}
                onChange={(e) => handleInputChange("actionPlan", e.target.value)}
                required
              />

              <Select
                label="Risk Level"
                placeholder="Select risk level"
                data={riskLevels}
                value={advisory.riskLevel}
                onChange={(value) => handleInputChange("riskLevel", value || "")}
                required
              />

              <Switch
                label="Active"
                checked={advisory.isActive}
                onChange={(e) => handleInputChange("isActive", e.currentTarget.checked)}
              />

              <Button 
                onClick={handleSubmit} 
                loading={loading}
                disabled={loading}
              >
                Create Advisory
              </Button>
            </Stack>
          </Card>
        </Box>

        {/* Right: Existing advisories list (scrollable) */}
        <Box>
          <Card withBorder style={{ height: '100%' }}>
            <Text size="md" fw={700} mb="sm">Existing Advisories</Text>
            <ScrollArea style={{ maxHeight: 520 }}>
              <Stack gap="sm">
                {advisoriesData && Object.keys(grouped).length > 0 ? (
                  riskLevels.map((rl) => (
                    grouped[rl.value] && grouped[rl.value].length > 0 ? (
                      <div key={rl.value}>
                        <Text size="sm" fw={600} mt="sm">{rl.label}</Text>
                        <Stack mt="xs">
                          {grouped[rl.value].map((adv) => (
                            <Card key={adv.id} withBorder padding="sm">
                              <Group justify="apart" align="flex-start">
                                <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleCardClick(adv)}>
                                  <Text fw={700} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adv.title}</Text>
                                  <Text size="xs" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{adv.description}</Text>
                                </div>
                                <Group gap="xs" align="center">
                                  <Badge color={adv.isActive ? 'green' : 'gray'}>{adv.riskLevel}</Badge>
                                  <Switch checked={adv.isActive} onChange={() => handleToggleActive(adv)} />
                                </Group>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </div>
                    ) : null
                  ))
                ) : (
                  <Alert color="yellow">No advisories created yet.</Alert>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Box>
      </SimpleGrid>

      {/* Edit Modal */}
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Advisory">
        {selectedAdvisory && (
          <Stack>
            <TextInput label="Title" value={selectedAdvisory.title} onChange={(e) => setSelectedAdvisory(prev => prev ? ({ ...prev, title: e.target.value }) : prev)} />
            <TextInput label="Description" value={selectedAdvisory.description} onChange={(e) => setSelectedAdvisory(prev => prev ? ({ ...prev, description: e.target.value }) : prev)} />
            <TextInput label="Action Plan" value={selectedAdvisory.actionPlan} onChange={(e) => setSelectedAdvisory(prev => prev ? ({ ...prev, actionPlan: e.target.value }) : prev)} />
            <Select label="Risk Level" data={riskLevels} value={selectedAdvisory.riskLevel} onChange={(v) => setSelectedAdvisory(prev => prev ? ({ ...prev, riskLevel: v || '' }) : prev)} />
            <Switch label="Active" checked={selectedAdvisory.isActive} onChange={(e) => setSelectedAdvisory(prev => prev ? ({ ...prev, isActive: e.currentTarget.checked }) : prev)} />
            <Group justify="right">
              <Button onClick={handleUpdate} loading={loading}>Update</Button>
              <Button variant="default" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Card>
  );
};

export default AdvisoryManagement;