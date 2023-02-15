import React from "react";

import { Box, Stack, Switch, Text, useMantineTheme } from "@mantine/core";

import { CreateLogEntry, GetLogs } from "../../wailsjs/go/backend/App";

function Settings() {
  const theme = useMantineTheme();

  const [logs, setLogs] = React.useState<string[]>([]);

  // Get logs on page open
  React.useEffect(() => {
    GetLogs().then((l) => {
      setLogs(l);
    });
  }, []);

  return (
    <Stack>
      <Switch
        label="Enable expert mode"
        description="Allows for flashing of custom firmware or nightly versions, and shows internal logs for Uplink."
        onChange={(checked) => {
          CreateLogEntry(
            "Set",
            `Expert mode ${checked ? "enabled" : "disabled"}`
          );
        }}
      />
      <Box
        sx={(theme) => ({
          height: "200px",
          overflowY: "auto",
          padding: theme.spacing.sm,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : "#fff",
          border: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[4]
          }`,
        })}
      >
        {logs.map((l) => (
          <Text>{l}</Text>
        ))}
      </Box>
    </Stack>
  );
}

export default Settings;
