import React from "react";
import {
  Badge,
  Button,
  Card,
  Center,
  Code,
  Flex,
  Group,
  Loader,
  Modal,
  Select,
  Space,
  Stack,
  Stepper,
  Text,
  Transition,
  UnstyledButton,
} from "@mantine/core";
import {
  IconDownload,
  IconGitBranch,
  IconTargetArrow,
  IconUsb,
} from "@tabler/icons";
import ReactMarkdown from "react-markdown";
import {
  FetchReleases,
  FetchTargets,
  FlashDfu,
  SaveFirmware,
} from "../../wailsjs/go/backend/App";
import { main as models } from "../../wailsjs/go/models";
import { showNotification } from "@mantine/notifications";

function Flash() {
  const [page, setPage] = React.useState(0);
  const [enableNext, setEnableNext] = React.useState(false);

  const [releasesLoaded, setReleasesLoaded] = React.useState(false);
  const [fetchedReleases, setFetchedReleases] =
    React.useState<models.FetchedReleases>(new models.FetchedReleases());
  const [fwVersion, setFwVersion] = React.useState<models.ReleaseMeta | null>();

  const [targetsLoaded, setTargetsLoaded] = React.useState(false);
  const [fetchedTargets, setFetchedTargets] =
    React.useState<models.FetchedTargets>(new models.FetchedTargets());
  const [fwTarget, setFwTarget] = React.useState<models.Target>();

  const [flashResult, setFlashResult] =
    React.useState<models.DfuFlashResponse>();

  const [flashing, setFlashing] = React.useState(false);

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page - 1);

  // Only enable next button when current step is complete
  React.useEffect(() => {
    if (page === 0) {
      setEnableNext(!!fwVersion); // Only enable target page if firmware is selected
    } else if (page === 1) {
      setEnableNext(!!fwTarget); // Only enable flash page if target is selected
    } else {
      setEnableNext(false); // There's no next page after Flash!
    }
  }, [page, fwVersion, fwTarget]);

  // Fetch releases on page open
  React.useEffect(() => {
    FetchReleases().then((r) => {
      setFetchedReleases(r);
      setReleasesLoaded(true);
    });
  }, []);

  // Fetch targets if on page 2
  React.useEffect(() => {
    if (page === 1) {
      if (targetsLoaded) return;

      console.log("Fetching targets for " + fwVersion?.value);

      FetchTargets(fwVersion!).then((targets: models.FetchedTargets) => {
        console.log(targets);
        setFetchedTargets(targets);
        setTargetsLoaded(true);
      });
    }
  }, [page]);

  const fetchReleaseByName = (tag: string | null) => {
    setTargetsLoaded(false); // Changing release invalidates targets
    setFwTarget(undefined);

    if (!tag) return undefined;

    // Fetch the release with the selected tag (Select returns a string)
    return fetchedReleases.releases.find((release) => {
      return release.value == tag;
    });
  };

  const fetchTargetByName = (name: string | null) => {
    if (!name) return undefined;

    // Fetch the target with the selected name (Select returns a string)
    return fetchedTargets.targets.find((target) => {
      return target.label == name;
    });
  };

  const flashRadio = () => {
    setFlashing(true);
    FlashDfu(fwTarget!.prefix).then((r) => {
      setFlashResult(r);
      setFlashing(false);
      setPage(3);
    });
  };

  const saveFirmware = () => {
    SaveFirmware(fwTarget!.prefix).then((s) => {
      if (s.status == 0) {
        showNotification({
          title: "Firmware saved!",
          message: `Firmware saved at ${s.path}.`,
          color: "green",
        });
      } else if (s.status == 2) {
        showNotification({
          title: "Firmware save cancelled.",
          message: "You can still flash the radio.",
          color: "yellow",
        });
      } else {
        showNotification({
          title: "Failed to save firmware!",
          message: "Save was either cancelled or missing write permissions.",
          color: "red",
        });
      }
    });
  };

  return (
    <>
      <Flex
        p="lg"
        direction="column"
        align="center"
        justify="space-between"
        h="100%"
      >
        <Stepper active={page} w="100%">
          <Stepper.Step
            label="Firmware"
            description="Choose your version"
            icon={<IconGitBranch size={18} />}
          >
            <Space h="lg" />
            <Select
              label="EdgeTX Version"
              placeholder={releasesLoaded ? "Select version..." : "Loading..."}
              itemComponent={FwItem}
              data={fetchedReleases.releases || []}
              value={fwVersion?.value || ""}
              maxDropdownHeight={295}
              nothingFound="No versions found"
              onChange={(v) => setFwVersion(fetchReleaseByName(v))}
              shadow="md"
              disabled={!!fetchedReleases.error || !releasesLoaded}
              transition="fade"
              transitionDuration={200}
              transitionTimingFunction="ease"
              w="100%"
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
                  <Card shadow="md" h={282} sx={{ overflowY: "auto" }}>
                    <Group>
                      <Text size={25} weight="bold">
                        EdgeTX {fwVersion!.value} Release Notes
                      </Text>
                      {fwVersion?.latest && (
                        <Badge variant="outline">Latest</Badge>
                      )}
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
            <Space h="lg" />
            <Select
              label="Radio Target"
              placeholder={
                targetsLoaded && !fetchedTargets.error
                  ? "Select target..."
                  : "Downloading firmware data..."
              }
              data={fetchedTargets.targets || []}
              value={fwTarget?.value || ""}
              maxDropdownHeight={295}
              searchable
              nothingFound="No targets found"
              onChange={(t) => setFwTarget(fetchTargetByName(t))}
              shadow="md"
              disabled={!!fetchedTargets.error || !targetsLoaded}
              transition="fade"
              transitionDuration={200}
              transitionTimingFunction="ease"
            />
            <Space h="md" />

            {fetchedTargets.error && (
              <>
                <Text color="red" weight="bold">
                  Error loading firmware targets!
                </Text>
                <Text color="red">{fetchedTargets.error.message}</Text>
              </>
            )}

            {fwTarget && (
              <Text size="md" weight="bold">
                Using firmware file with prefix <Code>{fwTarget?.prefix}</Code>
                {colorTargets.includes(fwTarget?.prefix) ? (
                  <Badge ml="xs" color="green">
                    Color
                  </Badge>
                ) : (
                  <Badge ml="xs" color="gray" variant="filled">
                    B&W
                  </Badge>
                )}
              </Text>
            )}
          </Stepper.Step>

          <Stepper.Step
            label="Flash"
            description="Install EdgeTX"
            icon={<IconDownload size={18} />}
          >
            <Center h={375}>
              <Group spacing={32}>
                <UnstyledButton onClick={flashRadio}>
                  <Card
                    radius="lg"
                    sx={(theme) => ({
                      backgroundColor: theme.fn.variant({
                        variant: "light",
                        color: "blue",
                      }).background,
                      color: theme.fn.variant({
                        variant: "light",
                        color: "blue",
                      }).color,
                      "&:hover": {
                        boxShadow: theme.shadows.lg,
                        backgroundColor: theme.colors.dark[5],
                      },
                      "&:active": {
                        backgroundColor: theme.colors.dark[6],
                      },
                      transition: "all 0.2s ease",
                    })}
                  >
                    <Stack w={200} h={200} align="center" justify="center">
                      <IconUsb size={96} />
                      <Text size="xl" weight="bold">
                        Flash Radio
                      </Text>
                    </Stack>
                  </Card>
                </UnstyledButton>
                <UnstyledButton onClick={saveFirmware}>
                  <Card
                    radius="lg"
                    sx={(theme) => ({
                      "&:hover": {
                        boxShadow: theme.shadows.lg,
                        backgroundColor: theme.colors.dark[5],
                      },
                      "&:active": {
                        backgroundColor: theme.colors.dark[6],
                      },
                      transition: "all 0.2s ease",
                    })}
                  >
                    <Stack w={200} h={200} align="center" justify="center">
                      <IconDownload size={96} />
                      <Text size="xl" weight="bold">
                        Save to File
                      </Text>
                    </Stack>
                  </Card>
                </UnstyledButton>
              </Group>
            </Center>
          </Stepper.Step>

          <Stepper.Completed>
            <Space h="lg" />
            <Center>
              <Text
                size={36}
                weight="bold"
                sx={(styles) => ({
                  color: flashResult?.success
                    ? styles.colors.dimmed
                    : styles.colors.red[5],
                })}
              >
                {flashResult?.success ? "Flash successful!" : "Flash failed."}
              </Text>
            </Center>
            <Space h="md" />
            <Text size="xl" color={flashResult?.success ? "dimmed" : "red"}>
              {flashResult?.output}
            </Text>
          </Stepper.Completed>
        </Stepper>
        <Button.Group w="100%">
          <Button
            variant="default"
            fullWidth
            disabled={page === 0 || page === 3}
            onClick={prevPage}
          >
            Back
          </Button>
          <Button fullWidth disabled={!enableNext} onClick={nextPage}>
            Next
          </Button>
        </Button.Group>
      </Flex>

      <Modal
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        opened={flashing}
        centered={true}
        onClose={() => {}}
        transitionDuration={300}
        radius="md"
      >
        <Stack p="md" align="center">
          <Group>
            <Loader />
            <Text size={36} weight="bold">
              Flashing...
            </Text>
          </Group>
          <Text size="lg" align="center">
            This may take a while; we'll let you know when it's done.{" "}
            <strong>Do not unplug your radio or close Uplink!</strong>
          </Text>
        </Stack>
      </Modal>
    </>
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
      <Group noWrap spacing="xs">
        <Text>
          {value} "{codename}"
        </Text>
        {latest && <Badge>Latest</Badge>}
      </Group>
    </div>
  )
);

const colorTargets = [
  "el18-",
  "nv14-",
  "x10-",
  "x10-access-",
  "x12s-",
  "t16-",
  "t18-",
  "tx16s-",
];
