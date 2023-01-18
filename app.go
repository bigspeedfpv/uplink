package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

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

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}

	read, err := zip.NewReader(bytes.NewReader(body), int64(len(body)))
	if err != nil {
		targets.Error = &ErrorWrapper{Message: err.Error()}
		return targets
	}

	for _, file := range read.File {
		if file.Name == "fw.json" {
			fwIdx, err := file.Open()
			if err != nil {
				targets.Error = &ErrorWrapper{Message: err.Error()}
				return targets
			}

			fwIdxRead, err := ioutil.ReadAll(fwIdx)
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
