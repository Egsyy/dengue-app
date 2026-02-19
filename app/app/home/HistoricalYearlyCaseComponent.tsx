"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { YearlyHistoricalDengueCases } from "@/models/HistoricalDengueCase";
import { TransformToYearlyCasesToChart } from "@/libraries/serializer/TransformYearlyHistoricalBarChart";
import ChartComponent from "@/components/app/ChartComponent";
import { getChartColors } from "@/libraries/ui/chart-theme";
import { Container, Loader, Paper, Center } from "@mantine/core";

interface YearlyDengueChartProps {
  data?: YearlyHistoricalDengueCases;
}

function getBarsPerView() {
  if (typeof window === "undefined") return 5;
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (w < 600) return 3;
  if (w > 600 && w < 1024) return h < w ? 5 : 3;
  if (w >= 1024 && w < 1440) return 5;
  return 10;
}

export default function HistoricalYearlyCaseComponent({
  data,
}: YearlyDengueChartProps) {
  const [barsPerPage, setBarsPerPage] = useState(5);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setBarsPerPage(getBarsPerView());

    function handleResize() {
      setBarsPerPage(getBarsPerView());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check data FIRST
  // if (!data?.TotalDengueCases) {
  //   console.log("Child - waiting for data");
  //   return null;
  // }

  // Then check if mounted (only matters if we have data)
  if (!isMounted) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  const chartData = TransformToYearlyCasesToChart(data);

  const chunks = [];
  for (let i = 0; i < chartData.labels.length; i += barsPerPage) {
    chunks.push({
      labels: chartData.labels.slice(i, i + barsPerPage),
      datasets: [
        {
          ...chartData.datasets[0],
          data: chartData.datasets[0].data.slice(i, i + barsPerPage),
        },
      ],
    });
  }

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container size="xl" py="md">
      <Swiper spaceBetween={20} slidesPerView={1}>
        {chunks.map((chunk, index) => (
          <SwiperSlide key={index}>
            <Paper p="md" radius="md" withBorder shadow="sm">
              <ChartComponent
                type="bar"
                data={chunk}
                options={options}
                height={300}
              />
            </Paper>
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  );
}
