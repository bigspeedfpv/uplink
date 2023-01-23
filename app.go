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

	"github.com/adrg/xdg"
	wails "github.com/wailsapp/wails/v2/pkg/runtime"

	"bigspeed.me/uplink/internal/pkg/config"
	"github.com/google/go-github/github"
	"golang.org/x/exp/slices"
	"golang.org/x/oauth2"
)

var version = "develop"

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetVersion returns the version of the application
func (a *App) GetVersion() string {
	return version
}

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
	var dfuUtilPath string

	if runtime.GOOS == "windows" && runtime.GOARCH == "amd64" {
		dfuUtilPath = config.Default() + "/support/win64/dfu-util.exe"
	} else if runtime.GOOS == "linux" && runtime.GOARCH == "amd64" {
		dfuUtilPath = config.Default() + "/support/linux-amd64/dfu-util"
	} else if runtime.GOOS == "darwin" {
		dfuUtilPath = config.Default() + "/support/darwin/dfu-util"
	} else {
		dfuUtilPath = "dfu-util"
	}

	err := copyFirmwareToFile(prefix, config.Default()+"/firmware.bin")
	if err != nil {
		return DfuFlashResponse{
			Success: false,
			Output:  "Failed to extract firmware file for flashing.",
		}
	}

	cmd := exec.Command(dfuUtilPath, "-a", "0", "--dfuse-address", "0x08000000", "--device", "0483:df11", "-D", config.Default()+"/firmware.bin")
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
