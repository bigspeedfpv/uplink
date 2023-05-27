import React, { useRef } from "react";
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
  useMantineTheme,
} from "@mantine/core";
import {
  IconDownload,
  IconGitBranch,
  IconInfoCircle,
  IconTargetArrow,
  IconUsb,
} from "@tabler/icons";
import ReactMarkdown from "react-markdown";
import { showNotification } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  FetchReleases,
  FetchTargets,
  FlashDfu,
  GetDFULogs,
  SaveFirmware,
} from "../../../wailsjs/go/backend/App";
import { backend as models } from "../../../wailsjs/go/models";
import { RootState } from "../../store";
import { colorTargets, FwItem } from "./helpers";

function Flash() {
  const theme = useMantineTheme();

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
  const [dfuOutput, setDfuOutput] = React.useState<string[]>();
  const dfuOutputRef = useRef<HTMLDivElement>(null);

  const dfuStatus = useSelector((state: RootState) => state.connection.value);

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
    FetchReleases(false).then((r) => {
      setFetchedReleases(r);
      setReleasesLoaded(true);
    });
  }, []);

  // Fetch targets if on page 2
  React.useEffect(() => {
    if (page === 1) {
      if (targetsLoaded) return;

      FetchTargets(fwVersion!).then((targets: models.FetchedTargets) => {
        setFetchedTargets(targets);
        setTargetsLoaded(true);
      });
    }
  }, [page]);

  // update DFU status every second while flashing
  React.useEffect(() => {
    if (!flashing) return undefined; // explicit return for concrete return type

    const interval = setInterval(() => {
      GetDFULogs().then((logs) => {
        setDfuOutput(logs);
        dfuOutputRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }, 1000); // dfu-util updates once per second

    return () => clearInterval(interval);
  }, [flashing]);

  const fetchReleaseByName = (tag: string | null) => {
    setTargetsLoaded(false); // Changing release invalidates targets
    setFwTarget(undefined);

    if (!tag) return undefined;

    // Fetch the release with the selected tag (Select returns a string)
    return fetchedReleases.releases.find((release) => release.value === tag);
  };

  const fetchTargetByName = (name: string | null) => {
    if (!name) return undefined;

    // Fetch the target with the selected name (Select returns a string)
    return fetchedTargets.targets.find((target) => target.label === name);
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
      if (s.status === 0) {
        showNotification({
          title: "Firmware saved!",
          message: `Firmware saved at ${s.path}.`,
          color: "green",
        });
      } else if (s.status === 2) {
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
                    <ReactMarkdown>{fwVersion!.releaseNotes}</ReactMarkdown>
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
                <UnstyledButton onClick={flashRadio} disabled={dfuStatus !== 2}>
                  <Card
                    radius="lg"
                    sx={{
                      boxShadow: dfuStatus === 2 ? theme.shadows.sm : "",
                      backgroundColor:
                        dfuStatus === 2
                          ? theme.fn.variant({
                              variant: "light",
                              color: "blue",
                            }).background
                          : theme.fn.variant({
                              variant: "subtle",
                              color: "gray",
                            }).color,
                      color:
                        dfuStatus === 2
                          ? theme.fn.variant({
                              variant: "light",
                              color: "blue",
                            }).color
                          : theme.colors.dark[5],
                      "&:hover": dfuStatus === 2 && {
                        boxShadow: theme.shadows.lg,
                        backgroundColor: theme.fn.variant({
                          variant: "light",
                          color: "blue",
                        }).hover,
                      },
                      transition: "all 0.2s ease",
                    }}
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
                    sx={{
                      boxShadow: theme.shadows.sm,
                      "&:hover": {
                        boxShadow: theme.shadows.lg,
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[5]
                            : theme.colors.gray[1],
                      },
                      transition: "all 0.2s ease",
                    }}
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

            {dfuStatus !== 2 && (
              <>
                {/* padding hack to keep the text just below the buttons */}
                <Group spacing={4} mt="-3.5rem" position="center">
                  <IconInfoCircle
                    size={20}
                    color={
                      theme.colorScheme === "dark"
                        ? theme.colors.red[4]
                        : theme.colors.red[6]
                    }
                  />
                  <Text
                    size="sm"
                    color={
                      theme.colorScheme === "dark"
                        ? theme.colors.red[4]
                        : theme.colors.red[6]
                    }
                  >
                    Flashing is disabled because no radio is detected.
                  </Text>
                </Group>
                <Space h="sm" />
              </>
            )}
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
        centered
        onClose={() => {}}
        transitionDuration={300}
        radius="md"
        size="auto"
      >
        <Stack p="md" align="center" spacing="xs">
          <Group>
            <Loader />
            <Text size={36} weight="bold">
              Flashing...
            </Text>
          </Group>
          <Text>This will take several minutes. Please do not close Uplink.</Text>
          <Card h={250} sx={{ overflowY: "auto" }}>
          {dfuOutput?.map(m => (
            <Text key={m}>
            <pre style={{ margin: 0 }}>
              { m }
              </pre>
            </Text>
            ))}
            <div ref={dfuOutputRef} />
          </Card>
        </Stack>
      </Modal>
    </>
  );
}

export default Flash;
