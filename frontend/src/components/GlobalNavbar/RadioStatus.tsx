import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconDeviceGamepad2 } from "@tabler/icons";

function RadioStatus() {
  const connected = useSelector((state: RootState) => state.connection.value);

  return (
    <Group position="center" spacing="xs" py="xs">
      <ThemeIcon
        variant="outline"
        sx={(theme) => ({
          border: "none",
          color: connected ? theme.colors.teal[4] : theme.colors.gray[6],
        })}
      >
        <IconDeviceGamepad2 size={24} />
      </ThemeIcon>
      <Text color={connected ? "teal.4" : "gray.6"}>
        {connected ? "Radio Connected" : "Radio Disconnected"}
      </Text>
    </Group>
  );
}

export default RadioStatus;
