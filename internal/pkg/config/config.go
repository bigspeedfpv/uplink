// Package config provides a handler for all user-specific settings and data.
package config

import (
	"runtime"

	"github.com/adrg/xdg"
)

// Default returns the OS's default config directory for Uplink.
// This is where all support files (dfu, firmware, etc) are stored.
func Default() string {
	return xdg.ConfigHome + "/uplink"
}

// DfuPath returns the correct path to dfu-util for the current OS.
func DfuPath() string {
	var dfuUtilPath string

	if runtime.GOOS == "windows" && runtime.GOARCH == "amd64" {
		dfuUtilPath = Default() + "/support/win64/dfu-util.exe"
	} else if runtime.GOOS == "linux" && runtime.GOARCH == "amd64" {
		dfuUtilPath = Default() + "/support/linux-amd64/dfu-util"
	} else if runtime.GOOS == "darwin" {
		dfuUtilPath = Default() + "/support/darwin/dfu-util"
	} else {
		dfuUtilPath = "dfu-util"
	}

	return dfuUtilPath
}
