import React from "react";
import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import { ScreenFormat } from "./targets";

interface TargetItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  label: string;
  radios: string[];
  isColor: boolean;
  format: ScreenFormat;
}

export const TargetItem = React.forwardRef<HTMLDivElement, TargetItemProps>(
  (
    { value, label, radios, isColor, format, ...others }: TargetItemProps,
    ref
  ) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} {...others}>
      <Stack spacing={0}>
        <Group noWrap spacing="xs">
          <Text size="lg" weight="bold">
            {label}
          </Text>
          {isColor ? (
            <Badge
              variant="gradient"
              gradient={{ from: "magenta", to: "teal.4" }}
            >
              Color
            </Badge>
          ) : (
            <Badge variant="filled" color="gray">
              B&W
            </Badge>
          )}
          <Badge color="gray" variant="outline">
            {format}
          </Badge>
        </Group>
        <Text color="dimmed">
          Supports {radios.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}
        </Text>
      </Stack>
    </div>
  )
);

export function CheckContainer(children: React.ReactNode) {
  return (
    <Box
      sx={(theme) => ({
        maxHeight: "200px",
        overflowY: "auto",
        padding: theme.spacing.sm,
        paddingTop: "0",
        borderRadius: theme.radius.sm,
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : "#fff",
        border: `1px solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[4]
        }`,
      })}
    >
      {children}
    </Box>
  );
}
