import React from "react";

import {
  Badge,
  Flex,
  Group,
  Select,
  Space,
  Stack,
  Stepper,
  Text,
} from "@mantine/core";
import { IconAdjustments } from "@tabler/icons";

function SdCard() {
  const [page, setPage] = React.useState(0);

  return (
    <Flex p="lg">
      <Stepper active={page} w="100%">
        <Stepper.Step
          label="Options"
          description="Set up your image"
          icon={<IconAdjustments size={18} />}
        >
          <Space h="lg" />
          <Select
            label="Radio Target"
            placeholder="Select a target..."
            data={targets.map((target) => ({
              value: target.name,
              label: target.name,
              radios: target.radios,
              isColor: target.isColor,
              format: target.format,
            }))}
            w="100%"
            itemComponent={TargetItem}
          />
        </Stepper.Step>
        <Stepper.Step
          label="Install"
          description="Copy to SD card"
        ></Stepper.Step>
      </Stepper>
    </Flex>
  );
}

export default SdCard;

enum ScreenFormat {
  Landscape = "Landscape",
  Portrait = "Portrait",
  ThreeByTwo = "3:2",
  Widescreen = "Widescreen",
}

type Target = {
  name: string;
  isColor: boolean;
  screenSize: string;
  format: ScreenFormat;
  radios: string[];
};

const targets: Target[] = [
  {
    name: "c480x272.zip",
    isColor: true,
    screenSize: "480x272",
    format: ScreenFormat.Landscape,
    radios: [
      "Radiomaster TX16S",
      "Jumper T16",
      "Jumper T18",
      "Horus X10S",
      "Horus X12S",
      "most other color screen radios",
    ],
  },
  {
    name: "c480x320.zip",
    isColor: true,
    screenSize: "480x320",
    format: ScreenFormat.Landscape,
    radios: ["Flysky Paladin PL18", "Flysky Paladin PL18 EV"],
  },
  {
    name: "c320x480.zip",
    isColor: true,
    screenSize: "320x480",
    format: ScreenFormat.Portrait,
    radios: ["Flysky Nirvana NV14", "Flysky Elysium EL18"],
  },
  {
    name: "bw128x64.zip",
    isColor: false,
    screenSize: "128x64",
    format: ScreenFormat.Landscape,
    radios: [
      "Jumper T-Lite/T-Pro",
      "Radiomaster TX12",
      "Radiomaster Zorro",
      "FrSky QX7",
      "FrSky X9 Lite",
      "FrSky X-Lite",
      "BetaFPV LiteRadio 3 Pro",
      "iFlight Commando 8",
    ],
  },
  {
    name: "bw212x64.zip",
    isColor: false,
    screenSize: "212x64",
    format: ScreenFormat.Widescreen,
    radios: ["FrSky X9D Series"],
  },
];

interface TargetItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  label: string;
  radios: string[];
  isColor: boolean;
  format: ScreenFormat;
}

const TargetItem = React.forwardRef<HTMLDivElement, TargetItemProps>(
  (
    { value, label, radios, isColor, format, ...others }: TargetItemProps,
    ref
  ) => (
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
          Supports{" "}
          {radios
            .map((v, i) => {
              if (i == radios.length - 1) return "and " + v;
              else return v;
            })
            .join(", ")}
        </Text>
      </Stack>
    </div>
  )
);
