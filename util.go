package main

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
