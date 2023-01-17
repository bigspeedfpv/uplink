package main

// FetchedReleases represents an array of release metadata along with an error status.
type FetchedReleases struct {
	Error    *FetchedReleasesError `json:"error,omitempty"`
	Releases []ReleaseMeta         `json:"releases"`
}

type FetchedReleasesError struct {
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
