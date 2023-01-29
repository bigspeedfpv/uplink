import {
  ActionIcon,
  Box,
  Group,
  Navbar,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Brand from "./Brand";
import {
  IconHome,
  IconDeviceGamepad2,
  IconDeviceSdCard,
  IconSettings,
  IconSun,
  IconMoonStars,
} from "@tabler/icons";
import Link from "./Link";
import RadioStatus from "./RadioStatus";

const links = [
  {
    icon: <IconHome size={20} />,
    color: "blue",
    label: "Welcome",
    to: "/",
  },
  {
    icon: <IconDeviceGamepad2 size={20} />,
    color: "cyan",
    label: "Flash EdgeTX",
    to: "/flash",
  },
  {
    icon: <IconDeviceSdCard size={20} />,
    color: "teal",
    label: "SD Card Setup",
    to: "/sdcard",
  },
];

function GlobalNavbar() {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Navbar width={{ base: 250 }} p="xs">
      <Navbar.Section mt="xs">
        <Brand />
      </Navbar.Section>
      <Navbar.Section grow mt="md">
        <Stack>
          {links.map((link) => (
            <Link key={link.label} {...link} />
          ))}
        </Stack>
      </Navbar.Section>

      <Navbar.Section>
        <RadioStatus />
        <Group
          sx={{
            borderTop: `1px solid ${
              theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[2]
            }`,
          }}
          pt={8}
          align="center"
          spacing="xs"
        >
          <Box sx={{ flexGrow: 100 }}>
            <Link
              icon={<IconSettings size={20} />}
              color="pink"
              label="Settings"
              to="/settings"
            />
          </Box>
          <ActionIcon
            onClick={() => toggleColorScheme()}
            size="lg"
            variant="default"
          >
            {colorScheme === "dark" ? (
              <IconSun size={16} />
            ) : (
              <IconMoonStars size={16} />
            )}
          </ActionIcon>
        </Group>
      </Navbar.Section>
    </Navbar>
  );
}

export default GlobalNavbar;
