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
		fmt.Println(err)
		return 0
	}

	// check if there's an EdgeTX radio connected (please spare me)
	radioFound := strings.Contains(string(out), "[0483:df11]")
	if !radioFound {
		return 1
	}

	return 2
}
