import { AppShell, MantineProvider } from "@mantine/core";
import GlobalNavbar from "../components/GlobalNavbar";
import { theme } from "../theme";
import { Outlet } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";

function Root() {
  return (
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
  );
}

export default Root;
