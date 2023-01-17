import React from "react";

import { Box, Group, Code } from "@mantine/core";

import LogoFull from "../../assets/images/logo-full.svg";
import { VersionContext } from "../../context/version.context";

function Brand() {
  const version = React.useContext(VersionContext);

  return (
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

        {version && <Code sx={{ fontWeight: 700 }}>{version}</Code>}
      </Group>
    </Box>
  );
}

export default Brand;
