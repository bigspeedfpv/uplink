import React from "react";
import { Badge, Group, Text } from "@mantine/core";
import { backend as models } from "../../../wailsjs/go/models";

interface FwItemProps
  extends React.ComponentPropsWithoutRef<"div">,
    models.ReleaseMeta {}

export const FwItem = React.forwardRef<HTMLDivElement, FwItemProps>(
  (
    {
      value,
      codename,
      latest,
      releaseNotes,
      browserDownloadUrl,
      date,
      ...others
    }: FwItemProps,
    ref
  ) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} {...others}>
      <Group noWrap spacing="xs">
        <Text>
          {value} &ldquo;{codename}&rdquo;
        </Text>
        {latest && <Badge>Latest</Badge>}
      </Group>
    </div>
  )
);

export const colorTargets = [
  "el18-",
  "nv14-",
  "x10-",
  "x10-access-",
  "x12s-",
  "t16-",
  "t18-",
  "tx16s-",
];
