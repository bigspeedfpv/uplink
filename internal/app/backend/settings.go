package backend

import (
	"bigspeed.me/uplink/internal/pkg/config"
)

// LoadConfig returns a the config struct. Loaded once at startup.
func (a *App) LoadConfig() config.Config {
	return config.ReadConfig()
}

// SetDarkMode writes the passed color scheme (true for dark, false for light) to config.json.
func (a *App) SetDarkMode(dark bool) {
	newConfig := config.ReadConfig()
	newConfig.Dark = dark

	config.WriteConfig(newConfig)
}
