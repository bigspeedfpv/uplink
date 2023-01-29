import React from "react";

import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import GlobalNavbar from "../components/GlobalNavbar";
import { Outlet } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";

function Root() {
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>("dark");
  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <AppShell
            padding="md"
            navbar={<GlobalNavbar />}
            sx={(theme) => ({
              main: {
                background:
                  colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],
              },
            })}
          >
            <Outlet />
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default Root;
