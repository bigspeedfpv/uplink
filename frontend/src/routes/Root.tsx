import React from "react";

import { AppShell, MantineProvider } from "@mantine/core";
import GlobalNavbar from "../components/GlobalNavbar";
import { theme } from "../theme";
import { Outlet } from "react-router-dom";
import { VersionProvider } from "../context/version.context";
import { NotificationsProvider } from "@mantine/notifications";

function Root() {
  return (
    <VersionProvider>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
          <AppShell
            padding="md"
            navbar={<GlobalNavbar />}
            styles={(theme) => ({
              main: {
                backgroundColor: theme.colors.dark[8],
              },
            })}
          >
            <Outlet />
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </VersionProvider>
  );
}

export default Root;
