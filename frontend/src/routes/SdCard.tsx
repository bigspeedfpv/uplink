import React from "react";

import {
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
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
  const [dest, setDest] = React.useState<string>();

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

  const setTargetByName = (t: string | null) => {
    if (!t) setTarget(undefined);

    if (t) {
      const target = targets.find((target) => target.name === t);
      if (target) {
        setTarget(target);
      }
    }
  };

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
          withAsterisk
          value={target?.name || ""}
          onChange={(t) => setTargetByName(t)}
        />

        <Select
          label="Destination"
          placeholder="Select a removable drive..."
          data={["/dev/sda", "/dev/sdb", "/dev/sdc"]}
          w="100%"
          withAsterisk
          onChange={(d) => setDest(d || "")}
        />

        <Checkbox.Group
          label="Select your sound pack(s)"
          orientation="vertical"
          inputContainer={CheckContainer}
        >
          {loadedLanguages?.map((language) => (
            <Checkbox
              key={language.directory}
              value={language.directory}
              label={language.description}
            />
          ))}
        </Checkbox.Group>

        <Checkbox.Group
          label="Select your scripts"
          orientation="vertical"
          inputContainer={CheckContainer}
        >
          {loadedScripts?.map((script) => (
            <Checkbox
              key={script.filename}
              value={script.filename}
              label={script.name}
            />
          ))}
        </Checkbox.Group>

        <Button disabled={!target || !dest}>Install</Button>
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

const CheckContainer = (children: React.ReactNode) => (
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
