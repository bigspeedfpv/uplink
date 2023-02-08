import { Box, Space, Stack, Text } from "@mantine/core";
import Link from "../components/GlobalNavbar/Link";
import { IconDeviceGamepad2, IconDeviceSdCard } from "@tabler/icons";

function Welcome() {
  return (
    <Stack h="100%" align="center" justify="center" spacing={0}>
      <Text size={40} weight="bold" color="white">
        Welcome to Uplink!
      </Text>
      <Text size="xl">What would you like to do?</Text>
      <Space h="lg" />
      <Box>
        <Link
          icon={<IconDeviceGamepad2 size={20} />}
          color="cyan"
          label="Install or Update EdgeTX"
          to="/flash"
        />
        <Link
          icon={<IconDeviceSdCard size={20} />}
          color="teal"
          label="Add Scripts or Sounds to your Radio"
          to="/sdcard"
        />
      </Box>
    </Stack>
  );
}

export default Welcome;
