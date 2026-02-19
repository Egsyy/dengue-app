import React from "react";
import { Box, Card, Grid, Title, Text, Stack, Paper, GridCol } from "@mantine/core";

export default function SigningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--mantine-color-gray-1)",
      }}
    >
      <Grid gutter={0} style={{ maxWidth: 1200, width: "100%" }}>
        {/* Left Side Panel */}
        <GridCol span={{ base: 0, md: 5 }} visibleFrom="md">
          <Paper
            p="xl"
            radius={0}
            style={{
              backgroundColor: "var(--mantine-color-gray-2)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Stack gap="md">
              <Title order={1} size="h2">
                Account Registration
              </Title>
              <Text c="dimmed">
                Provident cupiditate voluptatem et in. Quaerat fugiat ut
                assumenda excepturi exercitationem quasi. In deleniti eaque aut
                repudiandae et a id nisi.
              </Text>
            </Stack>
          </Paper>
        </GridCol>

        {/* Right Side Panel */}
        <GridCol span={{ base: 12, md: 7 }}>
          <Card shadow="xl" p="xl" radius="md" style={{ height: "100%" }}>
            {children}
          </Card>
        </GridCol>
      </Grid>
    </Box>
  );
}
