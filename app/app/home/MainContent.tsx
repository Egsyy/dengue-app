"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button, Grid, Stack, Text, Title, Box } from "@mantine/core";

type Props = {};

const MainContent = (props: Props) => {
  return (
    <Box>
      <Grid align="center" gutter="xl">
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 1, lg: 2 }}>
          <Box
            style={{
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              width={800}
              height={600}
              src="/images/Dengue_Water.webp"
              alt="mosquitos in water"
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </Box>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, lg: 1 }}>
          <Stack gap="md">
            <Title order={2}>
              Battle Against Dengue: Join Forces to Stop the Mosquito Menace!
            </Title>
            <Text fw={600} size="lg">
              Predict and prevent dengue outbreaks
            </Text>
            <Text c="dimmed" lh={1.7}>
              D-APP is a web app that uses real-time data and time series
              analysis to predict future dengue outbreaks. By analyzing weather
              patterns, historical case data, and geographic trends, the app
              provides early warnings, risk level maps, and health tips
              empowering users and health officials to take preventive action
              before outbreaks occur.
            </Text>

            <Button
              component={Link}
              href="/app/prediction"
              w={{ base: "100%", sm: "auto" }}
            >
              Predict Now
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MainContent;
