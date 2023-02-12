// Package config provides a handler for all user-specific settings and data.
package config

import (
	"encoding/json"
	"os"
	"os/exec"
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

// defaultConfig returns the default values for a config struct.
func defaultConfig() Config {
	return Config{Dark: true, Expert: false}
}

// DfuPath returns the correct path to dfu-util for the current OS.
func DfuPath() string {
	var dfuUtilPath string

	// first, check if dfu is installed globally
	if _, err := exec.LookPath("dfu-util"); err == nil {
		dfuUtilPath = "dfu-util"
	} else if runtime.GOOS == "windows" && runtime.GOARCH == "amd64" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "win64", "dfu-util.exe")
	} else if runtime.GOOS == "linux" && runtime.GOARCH == "amd64" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "linux-amd64", "dfu-util")
	} else if runtime.GOOS == "darwin" {
		dfuUtilPath = filepath.Join(DefaultDir(), "support", "darwin", "dfu-util")
	}

	return dfuUtilPath
}

// ReadConfig reads config.json from the Uplink directory
func ReadConfig() Config {
	var config Config

	// Read config.json
	configFile, err := os.Open(DefaultDir() + "/config.json")
	if err != nil {
		createConfig()
		return defaultConfig()
	}
	defer configFile.Close()

	// Parse config.json
	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		createConfig()
		return defaultConfig()
	}

	return config
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

// createConfig creates a default config.json file.
// Used when ReadConfig() fails to find a config.json file.
func createConfig() error {
	// Write default config
	if err := WriteConfig(defaultConfig()); err != nil {
		return err
	}

	return nil
}
