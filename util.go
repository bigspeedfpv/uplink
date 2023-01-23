package main

import (
	"archive/zip"
	"io"
	"os"
	"strings"

	"bigspeed.me/uplink/internal/pkg/config"
)

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
