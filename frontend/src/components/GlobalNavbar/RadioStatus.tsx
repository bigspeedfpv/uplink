import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import {
  Group,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconAlertOctagon, IconDeviceGamepad2 } from "@tabler/icons";

function RadioStatus() {
  const theme = useMantineTheme();

  const dfuStatus = useSelector((state: RootState) => state.connection.value);

  const [message, setMessage] = React.useState("");
  const [tooltipMessage, setTooltipMessage] = React.useState("");
  const [color, setColor] = React.useState("");

  React.useEffect(() => {
    if (dfuStatus === 0) {
      setMessage("dfu-util Error!");
      setTooltipMessage(
        `dfu-util not found! Please ensure you have execute permissions for Uplink's dfu-util binary or install dfu-util globally with your package manager.`
      );
      setColor(
        theme.colorScheme === "dark" ? theme.colors.red[4] : theme.colors.red[6]
      );
    } else if (dfuStatus === 1) {
      setMessage("Radio Disconnected");
      setTooltipMessage(
        "Radio not detected! To connect your radio, plug it in without powering it on."
      );
      setColor(theme.colors.gray[6]);
    } else {
      setMessage("Radio Connected");
      setTooltipMessage(
        "Your radio is connected in DFU mode! You can now flash your radio."
      );
      setColor(
        theme.colorScheme === "dark"
          ? theme.colors.teal[4]
          : theme.colors.teal[6]
      );
    }
  }, [dfuStatus]);

  return (
    <Tooltip
      multiline
      width={200}
      withArrow
      transitionDuration={300}
      label={tooltipMessage}
    >
      <Group position="center" spacing={8} py="xs">
        <ThemeIcon
          variant="outline"
          sx={{
            border: "none",
            color: color,
          }}
        >
          {dfuStatus === 0 ? (
            <IconAlertOctagon size={24} />
          ) : (
            <IconDeviceGamepad2 size={24} />
          )}
        </ThemeIcon>
        <Text color={color}>{message}</Text>
      </Group>
    </Tooltip>
  );
}

export default RadioStatus;
