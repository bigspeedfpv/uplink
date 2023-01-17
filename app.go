package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/go-github/github"
	"golang.org/x/exp/slices"
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

	client := github.NewClient(nil)

	releases, _, err := client.Repositories.ListReleases(context.Background(), "EdgeTX", "edgetx", nil)
	if err != nil {
		fetchedReleases.Error = FetchedReleasesError{Message: err.Error()}
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
