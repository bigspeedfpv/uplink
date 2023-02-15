import React from "react";

import {
  Button,
  Center,
  Checkbox,
  Flex,
  Select,
  Stack,
  Text,
} from "@mantine/core";

import { FetchPacks } from "../../../wailsjs/go/backend/App";
import { backend as models } from "../../../wailsjs/go/models";

import { Target, targets } from "./targets";
import { CheckContainer, TargetItem } from "./helpers";

function Index() {
  const [selectedTarget, setSelectedTarget] = React.useState<Target>();
  const [loadedLanguages, setLoadedLanguages] =
    React.useState<models.Language[]>();
  const [loadedScripts, setLoadedScripts] = React.useState<models.Script[]>();
  const [dest, setDest] = React.useState<string>();

  // Fetch languages when page opens
  React.useEffect(() => {
    FetchPacks().then((r: models.FetchPacksResponse) => {
      if (r.error) {
        setLoadedLanguages(undefined);
        setLoadedScripts(undefined);
      }

      setLoadedLanguages(r.languages);
      setLoadedScripts(r.scripts);
    });
  }, []);

  const setTargetByName = (t: string | null) => {
    if (!t) setSelectedTarget(undefined);

    if (t) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const target = targets.find((i) => i.name === t);
      if (target) {
        setSelectedTarget(target);
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
          value={selectedTarget?.name || ""}
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

        <Button disabled={!selectedTarget || !dest}>Install</Button>
      </Stack>
    </Flex>
  );
}

export default Index;
