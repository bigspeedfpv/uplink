// Package config provides a handler for all user-specific settings and data.
package config

import "github.com/adrg/xdg"

// Default returns the OS's default config directory for Uplink.
// This is where all support files (dfu, firmware, etc) are stored.
func Default() string {
	return xdg.ConfigHome + "/uplink"
}
