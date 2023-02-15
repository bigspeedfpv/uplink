import React, { ChangeEventHandler } from "react";

import {
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";

import { CreateLogEntry, GetLogs } from "../../wailsjs/go/backend/App";

function Settings() {
  const [expertMode, setExpertMode] = React.useState(false);

  const [logs, setLogs] = React.useState<string[]>([]);

  const toggleExpert: ChangeEventHandler<HTMLInputElement> = (e) => {
    CreateLogEntry(
      "Set",
      `Expert mode ${e.target.checked ? "enabled" : "disabled"}`
    ).catch();
    setExpertMode(e.target.checked);
  };

  // Get logs on page open
  React.useEffect(() => {
    GetLogs().then((l) => {
      setLogs(l);
    });
  }, []);

  return (
    <Stack>
      <Title>Settings</Title>
      <Switch
        label="Enable expert mode"
        description="Allows for flashing of custom firmware or nightly versions, and shows internal logs for Uplink."
        onChange={toggleExpert}
      />

      {expertMode && (
        <>
          <Divider my="sm" label="Application Logs" labelPosition="center" />
          <Stack>
            <Group>
              <Button variant="outline">Open Log Location</Button>
              <Button>Copy Logs to Clipboard</Button>
            </Group>
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
        </>
      )}
    </Stack>
  );
}

export default Settings;
