import React from "react";

import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { Outlet } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import GlobalNavbar from "../components/GlobalNavbar";
import { SetDarkMode } from "../../wailsjs/go/backend/App";
import { ConfigContext } from "../context/config.context";

function Root() {
  const config = React.useContext(ConfigContext);
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>(
    config.dark ? "dark" : "light"
  );
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  // Update config.json on dark mode toggle
  React.useEffect(() => {
    SetDarkMode(colorScheme === "dark");
  }, [colorScheme]);

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
