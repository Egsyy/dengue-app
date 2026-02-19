"use client";

import React, { useState } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Text, 
  Group, 
  TextInput, 
  NumberInput, 
  Select, 
  Modal, 
  Alert,
  Pagination,
  ActionIcon,
  useMantineTheme,
  Stack,
  Flex,
  LoadingOverlay
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import useSWR from "swr";
import WeeklyDengueCaseAPI, { 
  WeeklyDengueCase, 
  CreateWeeklyDengueCaseRequest,
  UpdateWeeklyDengueCaseRequest,
  WeeklyDengueCasesListResponse
} from "@/libraries/api/WeeklyDengueCaseAPI";
import { Localities } from "@/libraries/api/AdministrativeAreaAPI";
import { showNotification } from "@mantine/notifications";
import { ApiError } from "@/libraries/api/Client";

export function WeeklyDengueCasesManagement() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [editingCase, setEditingCase] = useState<WeeklyDengueCase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateWeeklyDengueCaseRequest>({
    psgcCode: "",
    year: new Date().getFullYear(),
    weekNumber: 1,
    caseCount: 0,
  });
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch barangays
  const { data: barangays = [] } = useSWR(
    "barangays",
    async () => {
      const municipalityPsgcCode = "0931700000";
      const list = await Localities.getAllBarangaysByPsgccode(municipalityPsgcCode);
      return list.map((b: any) => ({
        value: b.psgcCode,
        label: b.name,
      }));
    },
    { revalidateOnFocus: false }
  );

  // Fetch weekly dengue cases with filters
  const { data: weeklyCasesData, mutate: mutateWeeklyCases, error } = useSWR(
    ["weekly-dengue-cases", page, pageSize, selectedBarangay, selectedYear],
    async () => {
      return WeeklyDengueCaseAPI.getWeeklyDengueCases(
        page,
        pageSize,
        selectedBarangay || undefined,
        selectedYear || undefined
      );
    },
    { revalidateOnFocus: false }
  );

  const weeklyCases = weeklyCasesData?.cases || [];
  const totalCount = weeklyCasesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleCreate = () => {
    setFormData({
      psgcCode: selectedBarangay || "",
      year: selectedYear || new Date().getFullYear(),
      weekNumber: 1,
      caseCount: 0,
    });
    setEditingCase(null);
    setOpened(true);
  };

  const handleEdit = (weeklyCase: WeeklyDengueCase) => {
    setFormData({
      psgcCode: weeklyCase.psgcCode,
      year: weeklyCase.year,
      weekNumber: weeklyCase.weekNumber,
      caseCount: weeklyCase.caseCount,
    });
    setEditingCase(weeklyCase);
    setOpened(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await WeeklyDengueCaseAPI.deleteWeeklyDengueCase(id);
      showNotification({
        title: "Success",
        message: "Weekly dengue case deleted successfully",
        color: "teal",
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      });
      // Force refresh the data to show the updated list
      mutateWeeklyCases();
    } catch (error: any) {
      console.error("Error deleting weekly dengue case:", error);
      
      // Handle different error types
      let errorMessage = "Failed to delete weekly dengue case";
      
      if (error instanceof ApiError) {
        // Handle ApiError with status code
        if (error.status === 400) {
          errorMessage = error.details?.detail || 
                         error.details?.title || 
                         "Validation error: Please check your input";
        } else if (error.status === 404) {
          errorMessage = "Weekly dengue case not found";
        } else if (error.status === 403) {
          errorMessage = "You don't have permission to delete this case";
        } else if (error.details?.detail) {
          errorMessage = error.details.detail;
        }
      } else if (error?.response?.data?.detail) {
        // Handle response error
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        // Handle generic error
        errorMessage = error.message;
      }
      
      showNotification({
        title: `Error (${error instanceof ApiError ? error.status : 'Unknown'})`,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingCase) {
        await WeeklyDengueCaseAPI.updateWeeklyDengueCase(editingCase.id, formData);
        showNotification({
          title: "Success",
          message: "Weekly dengue case updated successfully",
          color: "teal",
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });
      } else {
        await WeeklyDengueCaseAPI.createWeeklyDengueCase(formData);
        showNotification({
          title: "Success",
          message: "Weekly dengue case created successfully",
          color: "teal",
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });
      }
      setOpened(false);
      // Force refresh the data to show the updated/created record
      mutateWeeklyCases();
    } catch (error: any) {
      console.error("Error submitting weekly dengue case:", error);
      
      // Handle different error types
      let errorMessage = editingCase 
        ? "Failed to update weekly dengue case" 
        : "Failed to create weekly dengue case";
      
      if (error instanceof ApiError) {
        // Handle ApiError with status code
        if (error.status === 400) {
          errorMessage = error.details?.detail || 
                         error.details?.title || 
                         "Validation error: Please check your input";
          
          // Show validation errors in the notification
          if (error.details?.errors) {
            const validationErrors = Object.values(error.details.errors)
              .flat()
              .join(', ');
            errorMessage += `: ${validationErrors}`;
          }
        } else if (error.status === 404) {
          errorMessage = "Weekly dengue case not found";
        } else if (error.status === 403) {
          errorMessage = "You don't have permission to perform this action";
        } else if (error.details?.detail) {
          errorMessage = error.details.detail;
        }
      } else if (error?.response?.data?.detail) {
        // Handle response error
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        // Handle generic error
        errorMessage = error.message;
      }
      
      showNotification({
        title: `Error (${error instanceof ApiError ? error.status : 'Unknown'})`,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarangayChange = (value: string | null) => {
    setSelectedBarangay(value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleYearChange = (value: string | number) => {
    setSelectedYear(typeof value === 'string' ? parseInt(value) : value);
    setPage(1); // Reset to first page when filter changes
  };

  const rows = weeklyCases.map((weeklyCase) => (
    <Table.Tr key={weeklyCase.id}>
      <Table.Td>{weeklyCase.barangayName}</Table.Td>
      <Table.Td>{weeklyCase.year}</Table.Td>
      <Table.Td>{weeklyCase.weekNumber}</Table.Td>
      <Table.Td>{weeklyCase.caseCount}</Table.Td>
      <Table.Td>
        <Flex gap={5}>
          <ActionIcon 
            color="blue" 
            onClick={() => handleEdit(weeklyCase)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon 
            color="red" 
            onClick={() => handleDelete(weeklyCase.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Alert variant="light" color="blue" title="Weekly Dengue Cases Management">
        <Text size="sm">
          Manage weekly dengue cases data. You can create, edit, and delete records. 
          Use the filters to view cases by barangay and year.
        </Text>
      </Alert>

      <Flex justify="space-between">
        <Flex gap="md">
          <Select
            placeholder="Select Barangay"
            data={barangays}
            value={selectedBarangay}
            onChange={handleBarangayChange}
            clearable
            style={{ width: 200 }}
          />
          <NumberInput
            placeholder="Year"
            value={selectedYear || undefined}
            onChange={handleYearChange}
            min={2020}
            max={2030}
            style={{ width: 120 }}
          />
        </Flex>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleCreate}
        >
          Add New Case
        </Button>
      </Flex>

      {error && (
        <Alert variant="light" color="red" title="Error">
          <Text size="sm">Failed to load weekly dengue cases data</Text>
        </Alert>
      )}

      <Card shadow="sm" padding="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Barangay</Table.Th>
              <Table.Th>Year</Table.Th>
              <Table.Th>Week</Table.Th>
              <Table.Th>Case Count</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        {totalCount > pageSize && (
          <Flex justify="center" mt="md">
            <Pagination 
              total={totalPages} 
              value={page} 
              onChange={setPage} 
            />
          </Flex>
        )}
      </Card>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={editingCase ? "Edit Weekly Dengue Case" : "Add New Weekly Dengue Case"}
        size="md"
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <LoadingOverlay visible={isSubmitting} />
        <Stack gap="md">
          <Select
            label="Barangay"
            placeholder="Select barangay"
            data={barangays}
            value={formData.psgcCode}
            onChange={(value) => setFormData({ ...formData, psgcCode: value || "" })}
            required
            disabled={isSubmitting}
          />
          <NumberInput
            label="Year"
            value={formData.year}
            onChange={(value) => setFormData({ ...formData, year: typeof value === 'string' ? parseInt(value) : value || new Date().getFullYear() })}
            min={2020}
            max={2030}
            required
            disabled={isSubmitting}
          />
          <NumberInput
            label="Week Number"
            value={formData.weekNumber}
            onChange={(value) => setFormData({ ...formData, weekNumber: typeof value === 'string' ? parseInt(value) : value || 1 })}
            min={1}
            max={53}
            required
            disabled={isSubmitting}
          />
          <NumberInput
            label="Case Count"
            value={formData.caseCount}
            onChange={(value) => setFormData({ ...formData, caseCount: typeof value === 'string' ? parseInt(value) : value || 0 })}
            min={0}
            required
            disabled={isSubmitting}
          />
          <Flex justify="flex-end" mt="md" gap="md">
            <Button variant="outline" onClick={() => setOpened(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
              {editingCase ? "Update" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </Stack>
  );
}