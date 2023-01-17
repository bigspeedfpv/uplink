import React from "react";

import { AppShell, MantineProvider, Text } from "@mantine/core";
import GlobalNavbar from "../components/GlobalNavbar";

function Root() {
  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <AppShell
        padding="md"
        navbar={<GlobalNavbar />}
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <Text>Hello World!</Text>
      </AppShell>
    </MantineProvider>
  );
}

export default Root;
