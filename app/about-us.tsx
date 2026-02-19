"use client";
import React, { forwardRef } from "react";
import { Box, Container, Title, Text, Stack, Grid } from "@mantine/core";

const AboutUs = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <Box
      id="about-us"
      ref={ref}
      component="section"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size="xl" py="xl">
        <Grid gutter="xl" align="center">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              <Title order={2} size="3.5rem">
                About Dengue Watch
              </Title>
              <Text size="lg" lh={1.7} c="dimmed">
                Dengue Watch is an open, community-oriented project that aims
                to give local health teams, researchers, and community
                organizations better tools to predict and prevent dengue
                outbreaks. We combine public and anonymized local data sources
                with weather and geospatial analysis to produce weekly risk
                forecasts and visual dashboards that are easy to understand and
                act on.
              </Text>

              <Text size="lg" lh={1.7} c="dimmed">
                Our goals:
                <br />
                - Provide timely, localized risk information for targeted
                interventions.
                <br />
                - Make model training and data workflows transparent and
                reproducible for public health teams.
                <br />
                - Encourage collaboration: share datasets, report issues, and
                contribute improvements via the project's repository.
              </Text>

              <Text size="lg" lh={1.7} c="dimmed">
                We take privacy and responsible use seriously — the platform
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }} visibleFrom="lg">
            <Box
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "33%",
                height: "100%",
                backgroundImage: "url('/blob.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: -1,
              }}
            />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
});

AboutUs.displayName = "AboutUs";

export default AboutUs;
