import { Box, Group } from "@mantine/core";
import { Code, Navbar } from "@mantine/core";

import LogoFull from "../assets/images/logo-full.svg";

function GlobalNavbar() {
  return (
    <Navbar width={{ base: 250 }} p="xs">
      <Navbar.Section mt="xs">
        <Box
          sx={(theme) => ({
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            paddingBottom: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.dark[4]}`,
          })}
        >
          <Group position="apart">
            <img src={LogoFull} alt="Uplink" height={30} />
            <Code sx={{ fontWeight: 700 }}>0.1.0</Code>
          </Group>
        </Box>
      </Navbar.Section>
    </Navbar>
  );
}

export default GlobalNavbar;
