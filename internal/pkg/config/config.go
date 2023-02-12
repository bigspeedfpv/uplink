// Package config provides a handler for all user-specific settings and data.
package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"

	"github.com/adrg/xdg"
)

// Config represents the user's config.json file.
type Config struct {
	Dark   bool `json:"dark"`
	Expert bool `json:"expert"`
}

// DefaultDir returns the OS's default config directory for Uplink.
// This is where all support files (dfu, firmware, etc) are stored.
func DefaultDir() string {
	return xdg.ConfigHome + "/uplink"
}

// DfuPath returns the correct path to dfu-util for the current OS.
func DfuPath() string {
	var dfuUtilPath string

	if runtime.GOOS == "windows" && runtime.GOARCH == "amd64" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "win64", "dfu-util.exe")
	} else if runtime.GOOS == "linux" && runtime.GOARCH == "amd64" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "linux-amd64", "dfu-util")
	} else if runtime.GOOS == "darwin" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "darwin", "dfu-util")
	} else {
		dfuUtilPath = "dfu-util"
	}

	return dfuUtilPath
}

// ReadConfig reads config.json from the Uplink directory
func ReadConfig() (Config, error) {
	var config Config

	// Read config.json
	configFile, err := os.Open(DefaultDir() + "/config.json")
	if err != nil {
		return config, err
	}
	defer configFile.Close()

	// Parse config.json
	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		return config, err
	}

	return config, nil
}

// WriteConfig writes the passed config object to config.json.
// Generates a default config if none exists.
func WriteConfig(config Config) error {
	// Create config.json
	configFile, err := os.Create(DefaultDir() + "/config.json")
	if err != nil {
		return err
	}
	defer configFile.Close()

	// Write config.json
	jsonEncoder := json.NewEncoder(configFile)
	jsonEncoder.SetIndent("", "    ")
	if err = jsonEncoder.Encode(config); err != nil {
		return err
	}

	return nil
}
