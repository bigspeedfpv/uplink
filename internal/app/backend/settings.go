package backend

import (
	"fmt"

	"bigspeed.me/uplink/internal/pkg/config"
)

// LoadConfig returns a the config struct. Loaded once at startup.
func (a *App) LoadConfig() config.Config {
	loadedConfig := config.ReadConfig()

	a.CreateLogEntry("Config", fmt.Sprintf("Loaded config: %+v", loadedConfig))

	return loadedConfig
}

// SetDarkMode writes the passed color scheme (true for dark, false for light) to config.json.
func (a *App) SetDarkMode(dark bool) {
	a.CreateLogEntry("Config", fmt.Sprintf("Dark mode set to %v.", dark))

	newConfig := config.ReadConfig()
	newConfig.Dark = dark

	config.WriteConfig(newConfig)
}

// SetExpertMode writes the passed expert mode state to config.json.
func (a *App) SetExpertMode(expert bool) {
	newConfig := config.ReadConfig()
	newConfig.Expert = expert

	config.WriteConfig(newConfig)
}
