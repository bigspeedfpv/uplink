import React from "react";

import {
  Badge,
  Center,
  Flex,
  Group,
  MultiSelect,
  Select,
  Space,
  Stack,
  Stepper,
  Text,
} from "@mantine/core";
import { IconAdjustments, IconDownload, IconMapPin } from "@tabler/icons";

import { FetchPacks } from "../../wailsjs/go/main/App";
import { main as models } from "../../wailsjs/go/models";

function SdCard() {
  const [page, setPage] = React.useState(0);

  const [target, setTarget] = React.useState<Target>();
  const [loadedLanguages, setLoadedLanguages] =
    React.useState<models.Language[]>();
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>();
  const [loadedScripts, setLoadedScripts] = React.useState<models.Script[]>();
  const [selectedScripts, setSelectedScripts] = React.useState<string[]>();

  // Fetch languages when page opens
  React.useEffect(() => {
    FetchPacks().then((r: models.FetchPacksResponse) => {
      if (r.error) {
        setLoadedLanguages(undefined);
        setLoadedScripts(undefined);
      }

      console.log(r);

      setLoadedLanguages(r.languages);
      setLoadedScripts(r.scripts);
    });
  }, []);

  return (
    <Flex p="lg">
      <Stack w="100%">
        <Center>
          <Text size={30} weight="bold">
            SD Card Setup
          </Text>
        </Center>
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
        <MultiSelect
          label="Voice Packs"
          placeholder="Select your languages..."
          data={
            loadedLanguages?.map((language) => ({
              value: language.directory,
              label: language.description,
            })) || []
          }
          onChange={setSelectedLanguages}
        />
        <MultiSelect
          label="Scripts"
          placeholder="Select your scripts..."
          itemComponent={ScriptItem}
          data={
            loadedScripts?.map((script) => ({
              value: script.filename,
              label: script.name,
              description: script.description,
            })) || []
          }
          onChange={setSelectedScripts}
        />
      </Stack>
    </Flex>
  );
}

export default SdCard;

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
          Supports {radios.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}
        </Text>
      </Stack>
    </div>
  )
);

interface ScriptItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  label: string;
  description: string;
}

const ScriptItem = React.forwardRef<HTMLDivElement, ScriptItemProps>(
  ({ value, label, description, ...others }: ScriptItemProps, ref) => (
    <div ref={ref} {...others}>
      <Stack spacing={0}>
        <Text size="lg" weight="bold">
          {label}
        </Text>
        <Text color="dimmed">{description}</Text>
      </Stack>
    </div>
  )
);

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
