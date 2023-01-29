package main

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
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetVersion returns the version of the application
func (a *App) GetVersion() string {
	return version
}

// CheckRadioConnected is periodically called and returns a boolean representing the connection status of the radio in bootloader mode.
func (a *App) CheckRadioConnected() bool {
	// THIS SHOULD NOT BE DONE THIS WAY, but until I find a better way to enumerate
	// USB devices this works (and it's cross-platform!)
	dfuUtilPath := config.DfuPath()

	// list all DFU devices (lol??????)
	cmd := command.Command(dfuUtilPath, "-l")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(err)
	}

	// check if there's an EdgeTX radio connected (please spare me)
	radioFound := strings.Contains(string(out), "[0483:df11]")

	return radioFound
}
