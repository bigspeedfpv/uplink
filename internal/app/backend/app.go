// Package backend contains all logic for the backend of the app.
// Methods in backend are called from the frontend/web view.
package backend

import (
	"context"
	"fmt"
	"strings"

	"bigspeed.me/uplink/internal/pkg/command"
	"bigspeed.me/uplink/internal/pkg/config"
)

var version = "develop"

// App struct
type App struct {
	ctx       context.Context
	dfuOutput []string
	logs      []string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.logs = []string{}

	a.CreateLogEntry("App", fmt.Sprintf("Uplink version %s started!", version))
	a.CreateLogEntry("DFU", fmt.Sprintf("dfu-util path is %s", config.DfuPath()))
}

// GetVersion returns the version of the application
func (a *App) GetVersion() string {
	return version
}

// CheckDfuStatus is periodically called and returns an int representing the connection status of the radio in bootloader mode.
// 0 = dfu-util not found or not executable
// 1 = radio not found
// 2 = radio found
func (a *App) CheckDfuStatus() int {
	// THIS SHOULD NOT BE DONE THIS WAY, but until I find a better way to enumerate
	// USB devices this works (and it's cross-platform!)
	dfuUtilPath := config.DfuPath()

	// list all DFU devices (lol??????)
	cmd := command.Command(dfuUtilPath, "-l")
	out, err := cmd.CombinedOutput()
	if err != nil {
		a.CreateLogEntry("DFU", "dfu-util not found or not executable")
		return 0
	}

	// check if there's an EdgeTX radio connected (please spare me)
	radioFound := strings.Contains(string(out), "[0483:df11]")
	if !radioFound {
		return 1
	}

	return 2
}
