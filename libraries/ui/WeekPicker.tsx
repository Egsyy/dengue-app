"use client";

import React from "react";
import { Select, Stack, Text } from "@mantine/core";

interface WeekPickerProps {
  value?: number;
  year?: number;
  onChange?: (week: number, year: number) => void;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

export const WeekPicker = ({
  value,
  year = new Date().getFullYear(),
  onChange,
  className = "",
  minYear = 2020,
  maxYear = new Date().getFullYear() + 1,
}: WeekPickerProps) => {
  const handleChange = (week: number, yearValue?: number) => {
    if (onChange) {
      onChange(week, yearValue || year);
    }
  };

  // Generate weeks for the current year
  const weeks = Array.from({ length: 53 }, (_, i) => i + 1);

  const weekOptions = weeks.map((week) => ({
    value: String(week),
    label: `Week ${week}`,
  }));

  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: String(minYear + i),
    label: String(minYear + i),
  }));

  return (
    <Stack gap="sm" className={className}>
      <Select
        label="Week"
        data={weekOptions}
        value={value ? String(value) : null}
        onChange={(val) => {
          if (val) {
            handleChange(Number(val), year);
          }
        }}
        searchable
        nothingFoundMessage="No week found"
      />

      <Select
        label="Year"
        data={yearOptions}
        value={String(year)}
        onChange={(val) => {
          if (val) {
            const selectedWeek = value || 1;
            handleChange(selectedWeek, Number(val));
          }
        }}
        searchable
        nothingFoundMessage="No year found"
      />
    </Stack>
  );
};

export default WeekPicker;
