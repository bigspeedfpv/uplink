import React from "react";

import { Box, Group, Code, useMantineTheme } from "@mantine/core";

import LogoLight from "../../assets/images/logo-light.svg";
import LogoDark from "../../assets/images/logo-dark.svg";
import { VersionContext } from "../../context/version.context";

function Brand() {
  const theme = useMantineTheme();

  const version = React.useContext(VersionContext);

  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.lg,
        borderBottom: `1px solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
        }`,
      })}
    >
      <Group position="apart">
        <img
          src={theme.colorScheme === "dark" ? LogoDark : LogoLight}
          alt="Uplink"
          height={30}
        />

        {version && <Code sx={{ fontWeight: 700 }}>{version}</Code>}
      </Group>
    </Box>
  );
}

export default Brand;
