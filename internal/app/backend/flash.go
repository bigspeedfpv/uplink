package backend

import (
	"archive/zip"
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"bigspeed.me/uplink/internal/pkg/command"
	"bigspeed.me/uplink/internal/pkg/config"
	"github.com/adrg/xdg"
	"github.com/google/go-github/github"
	"golang.org/x/exp/slices"
	"golang.org/x/oauth2"

	wails "github.com/wailsapp/wails/v2/pkg/runtime"
)

// FetchReleases returns all releases of EdgeTX.
func (a *App) FetchReleases(enablePreRelease bool) FetchedReleases {
	// Initialize the struct we will return
	var fetchedReleases FetchedReleases
	var client *github.Client

	ctx := context.Background()

	token := os.Getenv("UPLINK_OAUTH_TOKEN")

	if token == "" {
		client = github.NewClient(nil)
	} else {
		ts := oauth2.StaticTokenSource(
			&oauth2.Token{AccessToken: token},
		)
		client = github.NewClient(oauth2.NewClient(ctx, ts))
	}

	releases, _, err := client.Repositories.ListReleases(ctx, "EdgeTX", "edgetx", nil)
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Error fetching releases: %s", err.Error()))
		fetchedReleases.Error = &ErrorWrapper{Message: err.Error()}
		return fetchedReleases
	}

	// Only filter prereleases if in expert mode
	if !enablePreRelease {
		releases = filter(releases, func(release *github.RepositoryRelease) bool {
			return !*release.Prerelease
		})
	}

	// Create a list of all fetched release names for the log
	var releaseNames []string

	// Populate metadata for each release
	for idx, release := range releases {
		// slices.IndexFunc finds the first element that matches the predicate. We're looking for firmware assets specifically
		fwAsset := release.Assets[slices.IndexFunc(release.Assets, func(asset github.ReleaseAsset) bool {
			return strings.Contains(asset.GetName(), "edgetx-firmware")
		})]

		codename := strings.Split(release.GetName(), "\"")[1]

		releaseNames = append(releaseNames, *release.TagName)

		fetchedReleases.Releases = append(fetchedReleases.Releases, ReleaseMeta{
			Label:              *release.Name,
			Codename:           codename,
			Value:              *release.TagName,
			Date:               release.PublishedAt.String(),
			BrowserDownloadUrl: *fwAsset.BrowserDownloadURL,
			ReleaseNotes:       *release.Body,
			Latest:             idx == 0,
		})
	}

	a.CreateLogEntry("Flash", fmt.Sprintf("Fetched releases: %s", strings.Join(releaseNames, ", ")))

	return fetchedReleases
}

// FetchTargets downloads the firmware artifact from the selected version, saves it, and returns the target list.
func (a *App) FetchTargets(release ReleaseMeta) FetchedTargets {
	a.CreateLogEntry("Flash", fmt.Sprintf("Fetching targets for %s...", release.Label))

	var targets FetchedTargets

	resp, err := http.Get(release.BrowserDownloadUrl)
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Error fetching targets: %s", err.Error()))
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {

		}
	}(resp.Body)

	// Write response body to firmware.zip
	fwZip, err := os.Create(config.DefaultDir() + "/firmware.zip")
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Error creating firmware.zip: %s", err.Error()))
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}
	defer func(fwZip *os.File) {
		err := fwZip.Close()
		if err != nil {

		}
	}(fwZip)

	_, err = io.Copy(fwZip, resp.Body)
	if err != nil {
		return FetchedTargets{}
	}

	// ...and read BACK from the zip
	read, err := zip.OpenReader(config.DefaultDir() + "/firmware.zip")
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Error reading firmware.zip: %s", err.Error()))
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}

	// Read metadata from fw.json to return to frontend
	for _, file := range read.File {
		if file.Name == "fw.json" {
			fwIdx, err := file.Open()
			if err != nil {
				a.CreateLogEntry("Flash", fmt.Sprintf("Error opening fw.json: %s", err.Error()))
				targets.Error = &ErrorWrapper{Message: err.Error()}
				return targets
			}

			fwIdxRead, err := io.ReadAll(fwIdx)
			if err != nil {
				a.CreateLogEntry("Flash", fmt.Sprintf("Error reading fw.json: %s", err.Error()))
				targets.Error = &ErrorWrapper{Message: err.Error()}
			}

			var fetchedTargetList targetsMeta
			var fetchedPrefixes []string

			err = json.Unmarshal(fwIdxRead, &fetchedTargetList)
			if err != nil {
				return FetchedTargets{}
			}

			for _, target := range fetchedTargetList.Targets {
				fetchedPrefixes = append(fetchedPrefixes, target[1])

				targets.Targets = append(targets.Targets, Target{
					Label:  target[0],
					Value:  target[0],
					Prefix: target[1],
				})
			}

			a.CreateLogEntry("Flash", fmt.Sprintf("Fetched targets: %s", strings.Join(fetchedPrefixes, ", ")))

			targets.Changelog = fetchedTargetList.Changelog

			return targets
		}
	}

	a.CreateLogEntry("Flash", "Could not find fw.json in firmware artifact")
	targets.Error = &ErrorWrapper{Message: "Could not find fw.json in firmware artifact"}
	return targets
}

// CheckDfuAvailable returns a boolean representing the aviailability of dfu-util.
func (a *App) CheckDfuAvailable() bool {
	_, err := exec.LookPath(config.DfuPath())

	return err == nil
}

// FlashDfu flashes the connected radio with the firmware with the given prefix.
// DFU availability already verified with CheckDfuAvailable.
func (a *App) FlashDfu(prefix string) DfuFlashResponse {
	// reset DFU output for the UI
	a.dfuOutput = []string{}

	dfuUtilPath := config.DfuPath()

	err := copyFirmwareToFile(prefix, config.DefaultDir()+"/firmware.bin")
	if err != nil {
		a.CreateLogEntry("Flash", "Failed to extract firmware file for flashing.")
		return DfuFlashResponse{
			Success: false,
			Output:  "Failed to extract firmware file for flashing.",
		}
	}

	dfuArgs := []string{
		"-a",
		"0",
		"--dfuse-address",
		"0x08000000",
		"--device",
		"0483:df11",
		"-D",
		config.DefaultDir() + "/firmware.bin",
	}

	cmd := command.Command(dfuUtilPath, dfuArgs...)
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()
	err = cmd.Start()
	if err != nil {
		return DfuFlashResponse{}
	}

	go func() {
		scanner := bufio.NewScanner(stdout)
        scanner.Split(ScanCRLF)
		for scanner.Scan() {
			a.CreateLogEntry("DFU", scanner.Text())
		}
	}()

	go func() {
		scanner := bufio.NewScanner(stderr)
        scanner.Split(ScanCRLF)
		for scanner.Scan() {
			a.CreateLogEntry("DFU Error", scanner.Text())
		}
	}()

	err = cmd.Wait()
	if err != nil {
		a.CreateLogEntry("DFU", fmt.Sprintf("Failed to flash firmware: %s", err.Error()))
		return DfuFlashResponse{
			Success: false,
			Output:  err.Error(),
		}
	}

	a.CreateLogEntry("DFU", "Firmware flashed successfully.")
	return DfuFlashResponse{
		Success: true,
		Output:  "",
	}
}

// SaveFirmware saves the selected firmware file to a directory of the user's choice.
func (a *App) SaveFirmware(prefix string) SaveFirmwareStatus {
	location, err := wails.SaveFileDialog(a.ctx, wails.SaveDialogOptions{
		DefaultDirectory:           xdg.UserDirs.Documents,
		DefaultFilename:            "firmware.bin",
		Filters:                    []wails.FileFilter{{DisplayName: "Firmware Files", Pattern: "*.bin"}},
		ShowHiddenFiles:            false,
		CanCreateDirectories:       true,
		TreatPackagesAsDirectories: false,
	})
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Error opening save dialog: %s", err.Error()))
		return SaveFirmwareStatus{
			Status: 1,
			Path:   "",
		}
	}

	if location == "" {
		a.CreateLogEntry("Flash", "No location selected.")
		return SaveFirmwareStatus{
			Status: 2,
			Path:   "",
		}
	}

	err = copyFirmwareToFile(prefix, location)
	if err != nil {
		a.CreateLogEntry("Flash", fmt.Sprintf("Failed to copy firmware to file: %s", err.Error()))
		return SaveFirmwareStatus{
			Status: 1,
			Path:   "",
		}
	}

	a.CreateLogEntry("Flash", fmt.Sprintf("Firmware saved to %s", location))
	return SaveFirmwareStatus{
		Status: 0,
		Path:   location,
	}
}

// UTIL

// FetchedReleases represents an array of release metadata along with an error status.
type FetchedReleases struct {
	Error    *ErrorWrapper `json:"error,omitempty"`
	Releases []ReleaseMeta `json:"releases"`
}

type ErrorWrapper struct {
	Message string `json:"message"`
}

// ReleaseMeta represents the important metadata of a release to send to the frontend.
type ReleaseMeta struct {
	Label              string `json:"label"`
	Codename           string `json:"codename"`
	Value              string `json:"value"`
	Date               string `json:"date"`
	BrowserDownloadUrl string `json:"browserDownloadUrl"`
	ReleaseNotes       string `json:"releaseNotes"`
	Latest             bool   `json:"latest"`
}

// FetchedTargets is an internal representation of the list of targets and corresponding filenames.
type FetchedTargets struct {
	Error     *ErrorWrapper `json:"error,omitempty"`
	Targets   []Target      `json:"targets"`
	Changelog string        `json:"changelog"`
}

// Target holds metadata for one target.
type Target struct {
	Label  string `json:"label"` // Radio name
	Value  string `json:"value"`
	Prefix string `json:"prefix"`
}

// targetsMeta holds the metadata straight from the artifact.
type targetsMeta struct {
	Targets   [][]string `json:"targets"`
	Changelog string     `json:"changelog"`
}

// DfuFlashResponse represents the status of a DFU flash and the output of the command.
type DfuFlashResponse struct {
	Success bool   `json:"success"`
	Output  string `json:"output"`
}

// Filter returns a new slice containing all elements of s that satisfy fn.
func filter[T any](s []T, fn func(T) bool) []T {
	var p []T
	for _, v := range s {
		if fn(v) {
			p = append(p, v)
		}
	}
	return p
}

// copyFirmwareToFile copies the firmware bin from the zip to the passed directory.
func copyFirmwareToFile(prefix string, location string) error {
	// Open artifact zip for reading
	read, err := zip.OpenReader(config.DefaultDir() + "/firmware.zip")
	if err != nil {
		return err
	}
	defer func(read *zip.ReadCloser) {
		err := read.Close()
		if err != nil {

		}
	}(read)

	// Loop through each file to find the correct target
	var firmwareFile *zip.File
	for _, file := range read.File {
		if strings.Contains(file.Name, prefix) {
			// If filename is shorter than previously found file, it's a better match
			if firmwareFile == nil || len(file.Name) < len(firmwareFile.Name) {
				firmwareFile = file
			}
		}
	}

	firmware, err := firmwareFile.Open()
	if err != nil {
		return err
	}
	defer func(firmware io.ReadCloser) {
		err := firmware.Close()
		if err != nil {

		}
	}(firmware)

	// Create bin for flashing
	bin, err := os.Create(location)
	if err != nil {
		return err
	}
	defer func(bin *os.File) {
		err := bin.Close()
		if err != nil {

		}
	}(bin)

	_, err = io.Copy(bin, firmware)
	if err != nil {
		return err
	}

	return nil
}

// SaveFirmwareStatus represents whether a firmware save operation was successful, failed, or was cancelled.
type SaveFirmwareStatus struct {
	Status int    `json:"status"` // 0 = success, 1 = failure, 2 = cancelled
	Path   string `json:"path"`
}
