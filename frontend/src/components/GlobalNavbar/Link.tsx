import React from "react";
import {
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { CreateLogEntry } from "../../../wailsjs/go/backend/App";

interface LinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  to: string;
}

function NavLink(props: LinkProps) {
  const { icon, color, label, to } = props;

  const theme = useMantineTheme();

  const location = useLocation();

  return (
    <UnstyledButton
      component={Link}
      onClick={() => CreateLogEntry("Nav", `Clicked on ${label}`)}
      to={to}
      sx={{
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        backgroundColor:
          location.pathname === to
            ? theme.fn.variant({
                variant: "light",
                color,
              }).background
            : "transparent",
        boxShadow: location.pathname === to ? theme.shadows.sm : "transparent",

        "&:hover": {
          backgroundColor:
            // this line makes me cry every time i open this file
            // eslint-disable-next-line no-nested-ternary
            location.pathname === to
              ? theme.fn.variant({
                  variant: "light",
                  color,
                }).background
              : theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          boxShadow: theme.shadows.md,
        },

        transition: "all 150ms",
      }}
    >
      <Group>
        <ThemeIcon color={color} variant="light" size={32}>
          {icon}
        </ThemeIcon>

        <Text
          size="md"
          color={
            theme.colorScheme === "dark"
              ? theme.colors.dark[1]
              : theme.colors.gray[7]
          }
        >
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export default NavLink;
