"use client";

import { Calendar } from "@mantine/dates";
import { useCalendarContext } from "@/libraries/contexts/CalendarContext";
import { Alert, Paper, Stack, Text, Group } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useState } from "react";

// Extend dayjs with plugins
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface MantineCalendarProps {
  className?: string;
  allowSingleDateSelection?: boolean;
  allowRangeSelection?: boolean;
  maxDate?: Date;
  minDate?: Date;
  excludeDates?: Date[];
  highlightDates?: Date[];
}

export const MantineCalendar = ({
  className = "",
  maxDate,
  minDate,
  excludeDates = [],
  highlightDates = [],
}: MantineCalendarProps) => {
  // Subscribe to the actual state value that changes
  const selectedDateISO = useCalendarContext().selectedDateISO;

  // Get the methods
  const { selectDate, isInISOWeekRange, isDateIsDisabled } =
    useCalendarContext();

  const [hovered, setHovered] = useState<string | null>(null);

  console.log("Calendar re-rendered, selectedDateISO:", selectedDateISO); // Debug log

  return (
    <Paper
      shadow="md"
      radius="md"
      p="md"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <Stack gap="md" h="100%">
        <Group justify="center" align="flex-start" wrap="wrap" gap="lg">
          <Calendar
            styles={{
              weekday: {
                color: "var(--mantine-color-teal-6)",
                fontWeight: 700,
                fontSize: "1.1rem",
              },
            }}
            onNextYear={() => null}
            firstDayOfWeek={1} // Monday
            weekendDays={[0, 6]} // Saturday and Sunday
            size="xl"
            withCellSpacing={false}
            getDayProps={(date) => {
              const dateString = dayjs(date).format("YYYY-MM-DD");
              const isHovered =
                isInISOWeekRange(dateString) && hovered
                  ? isInISOWeekRange(hovered)
                  : false;
              const isSelected = isInISOWeekRange(dateString);
              const isInRange = isHovered || isSelected;
              const isDisabled = isDateIsDisabled(new Date(date));
              return {
                onMouseEnter: () => setHovered(dateString),
                onMouseLeave: () => setHovered(null),
                disabled: isDisabled,
                inRange: isInRange,
                firstInRange: isInRange && dayjs(date).isoWeekday() === 1, // Monday
                lastInRange: isInRange && dayjs(date).isoWeekday() === 7, // Sunday
                selected: isSelected,
                onClick: () => {
                  console.log("Clicking date:", date); // Debug log
                  selectDate(new Date(date));
                },
              };
            }}
          />
          <Alert
            variant="light"
            color="teal"
            title="Disclaimer"
            icon={<IconInfoCircle />}
            style={{ maxWidth: 400 }}
          >
            <Text size="sm">
              The selected date will be converted to its corresponding ISO week
              for prediction purposes. Forecasts are based on weekly data and
              include a two-week lag in weather information.
            </Text>
          </Alert>
        </Group>
      </Stack>
    </Paper>
  );
};

export default MantineCalendar;
