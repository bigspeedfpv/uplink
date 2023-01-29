import { AppShell, useMantineTheme } from "@mantine/core";
import GlobalNavbar from "../components/GlobalNavbar";
import { Outlet } from "react-router-dom";

function Root() {
  const theme = useMantineTheme();

  return (
    <AppShell
      padding="md"
      navbar={<GlobalNavbar />}
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
    >
      <Outlet />
    </AppShell>
  );
}

export default Root;
