"use client";

import { useCalendarContext } from "@/libraries/contexts/CalendarContext";
import MantineCalendar from "@/libraries/ui/MantineCalendar";
import { WeatherPoolingData } from "@/libraries/api/WeatherPoolingAPI";
import useSWR from "swr";
import { Stack, Button, Container } from "@mantine/core";
import Link from "next/link";

export default function CalendarPage() {
  const { addLatestWeatherPooledDate } = useCalendarContext();

  useSWR(
    "get-weather-pool-data",
    () => WeatherPoolingData.getLatestWeatherPooledDate(),
    {
      onSuccess: (data) => {
        if (data?.date) addLatestWeatherPooledDate(new Date(data.date));
      },
    },
  );

  return (
    <Container size="md" py="xl">
      <Stack gap="lg" align="center">
        <MantineCalendar
          allowSingleDateSelection={true}
          allowRangeSelection={true}
        />
        <Button
          component={Link}
          href="/app/prediction"
          size="lg"
          fullWidth
          maw={400}
        >
          Start Predicting
        </Button>
      </Stack>
    </Container>
  );
}
