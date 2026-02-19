"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Overlay,
  Text,
  Title,
  Stack,
} from "@mantine/core";

const Landing = () => {
  const router = useRouter();

  function handleGetStarted() {
    router.push("/app");
  }

  return (
    <Box
      id="landing"
      component="section"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('/images/mosquitoOnLeaf.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Overlay color="#000" backgroundOpacity={0.6} zIndex={1} />

      <Container
        size="md"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "15vh",
          paddingBottom: "4rem",
        }}
      >
        <Stack gap="lg" maw={500}>
          <Title order={1} c="white" fw={700} size="3rem">
            Predict and prevent Dengue outbreaks
          </Title>

          <Text c="white" size="lg" lh={1.6}>
            Dengue Watch helps local health teams, researchers, and community
            volunteers anticipate and reduce dengue outbreaks. The project
            combines historical dengue case data, aggregated weather signals,
            and geospatial context to produce weekly risk forecasts,
            outbreak-probability scores, and easy-to-read dashboards.
            
            This is a community-focused, open approach — administrators can
            generate training datasets, retrain models from the web UI, and
            track model versions so predictions stay current as new data are
            added. Our goal is to empower local decision makers with timely
            insights so interventions can be targeted where they matter most.
          </Text>

          <Button
            size="lg"
            color="teal"
            onClick={handleGetStarted}
            w={{ base: "100%", sm: "auto" }}
          >
            Get Started
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Landing;
