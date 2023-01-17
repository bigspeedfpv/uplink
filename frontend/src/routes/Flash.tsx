import React from "react";
import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Select,
  Space,
  Stepper,
  Text,
  Transition,
} from "@mantine/core";
import { IconGitBranch, IconDownload, IconTargetArrow } from "@tabler/icons";
import ReactMarkdown from "react-markdown";
import { FetchReleases } from "../../wailsjs/go/main/App";
import { main as models } from "../../wailsjs/go/models";

function Flash() {
  const [fetchedReleases, setFetchedReleases] =
    React.useState<models.FetchedReleases>(new models.FetchedReleases());
  const [page, setPage] = React.useState(0);
  const [enableNext, setEnableNext] = React.useState(false);
  const [fwVersion, setFwVersion] = React.useState<models.ReleaseMeta | null>();
  const [fwTarget, setFwTarget] = React.useState("Taranis X9D+ 2019");

  // Fetch releases on page open
  React.useEffect(() => {
    FetchReleases().then((r) => {
      setFetchedReleases(r);
    });
  }, []);

  const fetchRelease = (tag: string | null) => {
    if (!tag) return null;

    // Fetch the release with the selected tag (Select returns a string)
    return fetchedReleases.releases.find((release) => {
      return release.value == tag;
    });
  };

  // Only enable next button when current step is complete
  React.useEffect(() => {
    if (page === 0) {
      if (fwVersion) {
        setEnableNext(true);
      } else {
        setEnableNext(false);
      }
    }
  }, [page, fwVersion]);

  return (
    <Flex
      p="lg"
      direction="column"
      align="center"
      justify="space-between"
      h="100%"
    >
      <Stepper
        active={page}
        onStepClick={setPage}
        allowNextStepsSelect={false}
        w="100%"
      >
        <Stepper.Step
          label="Firmware"
          description="Choose your version"
          icon={<IconGitBranch size={18} />}
        >
          <Space h="lg" />
          <Select
            label="EdgeTX Version"
            placeholder="Select version..."
            itemComponent={FwItem}
            data={fetchedReleases.releases || []}
            maxDropdownHeight={400}
            nothingFound="No versions found"
            onChange={(v) => setFwVersion(fetchRelease(v))}
            shadow="md"
            disabled={!!fetchedReleases.error}
          />

          {fetchedReleases.error && (
            <Text color="red">
              Failed to fetch releases: {fetchedReleases.error.message}
            </Text>
          )}

          <Transition
            mounted={!!fwVersion}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <div style={styles}>
                <Space h="md" />
                <Card shadow="md" h={280} sx={{ overflowY: "auto" }}>
                  <Group>
                    <Text size={25} weight="bold">
                      EdgeTX {fwVersion!.value} Release Notes
                    </Text>
                    {fwVersion?.latest && <Badge>Latest</Badge>}
                  </Group>
                  <ReactMarkdown children={fwVersion!.releaseNotes} />
                </Card>
              </div>
            )}
          </Transition>
        </Stepper.Step>
        <Stepper.Step
          label="Target"
          description="Select your radio"
          icon={<IconTargetArrow size={18} />}
        >
          bbbb
        </Stepper.Step>
        <Stepper.Step
          label="Flash"
          description="Install EdgeTX"
          icon={<IconDownload size={18} />}
        >
          cccc
        </Stepper.Step>
        <Stepper.Completed>DONE</Stepper.Completed>
      </Stepper>

      <Button.Group w="100%">
        <Button variant="default" fullWidth disabled>
          Back
        </Button>
        <Button fullWidth disabled={!enableNext}>
          Next
        </Button>
      </Button.Group>
    </Flex>
  );
}

export default Flash;

interface FwItemProps
  extends React.ComponentPropsWithoutRef<"div">,
    models.ReleaseMeta {}

const FwItem = React.forwardRef<HTMLDivElement, FwItemProps>(
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
    <div ref={ref} {...others}>
      <Group noWrap>
        <Text>
          {value} "{codename}"
        </Text>
        {latest && <Badge>Latest</Badge>}
      </Group>
    </div>
  )
);
