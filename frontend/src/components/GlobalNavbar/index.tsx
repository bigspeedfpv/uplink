import { Navbar } from "@mantine/core";
import Brand from "./Brand";
import { IconHome, IconDownload, IconDeviceSdCard } from "@tabler/icons";
import Link from "./Link";

const links = [
  {
    icon: <IconHome size={20} />,
    color: "blue",
    label: "Welcome",
    to: "/welcome",
  },
  {
    icon: <IconDownload size={20} />,
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
  return (
    <Navbar width={{ base: 230 }} p="xs">
      <Navbar.Section mt="xs">
        <Brand />
      </Navbar.Section>
      <Navbar.Section grow mt="md">
        <div>
          {links.map((link) => (
            <Link key={link.label} {...link} />
          ))}
        </div>
      </Navbar.Section>
    </Navbar>
  );
}

export default GlobalNavbar;
