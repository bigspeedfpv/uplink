package main

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
	"runtime"
	"strings"

	"bigspeed.me/uplink/internal/pkg/command"
	"bigspeed.me/uplink/internal/pkg/config"
	"github.com/adrg/xdg"
	"github.com/google/go-github/github"
	"golang.org/x/exp/slices"
	"golang.org/x/oauth2"

	wails "github.com/wailsapp/wails/v2/pkg/runtime"
)

// FUNCTIONS
// FetchReleases returns all releases of EdgeTX.
func (a *App) FetchReleases() FetchedReleases {
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
		fetchedReleases.Error = &ErrorWrapper{Message: err.Error()}
		return fetchedReleases
	}

	// Filter out pre-releases
	releases = filter(releases, func(release *github.RepositoryRelease) bool {
		return !*release.Prerelease
	})

	// Populate metadata for each release
	for idx, release := range releases {
		fwAsset := release.Assets[slices.IndexFunc(release.Assets, func(asset github.ReleaseAsset) bool {
			return strings.Contains(asset.GetName(), "edgetx-firmware")
		})]

		codename := strings.Split(release.GetName(), "\"")[1]

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

	return fetchedReleases
}

// FetchTargets downloads the firmware artifact from the selected version, saves it, and returns the target list.
func (a *App) FetchTargets(release ReleaseMeta) FetchedTargets {
	var targets FetchedTargets

	resp, err := http.Get(release.BrowserDownloadUrl)
	if err != nil {
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}
	defer resp.Body.Close()

	// Write response body to firmware.zip
	fwZip, err := os.Create(config.Default() + "/firmware.zip")
	if err != nil {
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}
	defer fwZip.Close()
	io.Copy(fwZip, resp.Body)

	// ...and read BACK from the zip
	read, err := zip.OpenReader(config.Default() + "/firmware.zip")
	if err != nil {
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}

	// Read metadata from fw.json to return to frontend
	for _, file := range read.File {
		if file.Name == "fw.json" {
			fwIdx, err := file.Open()
			if err != nil {
				targets.Error = &ErrorWrapper{Message: err.Error()}
				return targets
			}

			fwIdxRead, err := io.ReadAll(fwIdx)
			if err != nil {
				targets.Error = &ErrorWrapper{Message: err.Error()}
			}

			var fetchedTargetList targetsMeta

			json.Unmarshal(fwIdxRead, &fetchedTargetList)

			for _, target := range fetchedTargetList.Targets {
				targets.Targets = append(targets.Targets, Target{
					Label:  target[0],
					Value:  target[0],
					Prefix: target[1],
				})
			}

			targets.Changelog = fetchedTargetList.Changelog

			return targets
		}
	}

	targets.Error = &ErrorWrapper{Message: "Could not find fw.json in firmware artifact"}
	return targets
}

// CheckDfuAvailable returns a boolean representing the aviailability of dfu-util.
func (a *App) CheckDfuAvailable() bool {
	_, err := exec.LookPath("dfu-util")

	return (runtime.GOOS == "windows" && runtime.GOARCH == "amd64") ||
		(runtime.GOOS == "linux" && runtime.GOARCH == "amd64") ||
		(runtime.GOOS == "darwin") ||
		(err == nil)
}

// FlashDfu flashes the connected radio with the firmware with the given prefix.
// DFU availability already verified with CheckDfuAvailable.
func (a *App) FlashDfu(prefix string) DfuFlashResponse {
	dfuUtilPath := config.DfuPath()

	err := copyFirmwareToFile(prefix, config.Default()+"/firmware.bin")
	if err != nil {
		return DfuFlashResponse{
			Success: false,
			Output:  "Failed to extract firmware file for flashing.",
		}
	}

	cmd := command.Command(dfuUtilPath, "-a", "0", "--dfuse-address", "0x08000000", "--device", "0483:df11", "-D", config.Default()+"/firmware.bin")
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()
	cmd.Start()

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			fmt.Println(scanner.Text())
		}
	}()

	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			fmt.Println(scanner.Text())
		}
	}()

	err = cmd.Wait()
	if err != nil {
		return DfuFlashResponse{
			Success: false,
			Output:  err.Error(),
		}
	}

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
		return SaveFirmwareStatus{
			Status: 1,
			Path:   "",
		}
	}

	if location == "" {
		return SaveFirmwareStatus{
			Status: 2,
			Path:   "",
		}
	}

	err = copyFirmwareToFile(prefix, location)
	if err != nil {
		return SaveFirmwareStatus{
			Status: 1,
			Path:   "",
		}
	}
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

// fetchedTargets is an internal representation of the list of targets and corresponding filenames.
type FetchedTargets struct {
	Error     *ErrorWrapper `json:"error,omitempty"`
	Targets   []Target      `json:"targets"`
	Changelog string        `json:"changelog"`
}

// target holds metadata for one target.
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
	read, err := zip.OpenReader(config.Default() + "/firmware.zip")
	if err != nil {
		return err
	}
	defer read.Close()

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
	defer firmware.Close()

	// Create bin for flashing
	bin, err := os.Create(location)
	if err != nil {
		return err
	}
	defer bin.Close()

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
