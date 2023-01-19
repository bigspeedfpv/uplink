import React from "react";
import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";

interface LinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  to: string;
}

function NavLink(props: LinkProps) {
  const location = useLocation();

  return (
    <UnstyledButton
      component={Link}
      to={props.to}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        backgroundColor:
          location.pathname === props.to
            ? theme.fn.variant({
                variant: "light",
                color: props.color,
              }).background
            : "transparent",
        boxShadow:
          location.pathname === props.to ? theme.shadows.md : "transparent",

        "&:hover": {
          backgroundColor:
            location.pathname === props.to
              ? theme.fn.variant({
                  variant: "light",
                  color: props.color,
                }).background
              : theme.colors.dark[6],
          boxShadow: theme.shadows.md,
        },

        transition: "all 100ms ease-in-out",
      })}
    >
      <Group>
        <ThemeIcon color={props.color} variant="light" size={32}>
          {props.icon}
        </ThemeIcon>

        <Text size="md">{props.label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export default NavLink;
