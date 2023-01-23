package main

import (
	"embed"
	"fmt"

	"bigspeed.me/uplink/internal/pkg/config"
	"github.com/joho/godotenv"
	"github.com/soypat/rebed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

// Embed support files (dfu-util) in the binary.
//
//go:embed all:support
var supportFiles embed.FS

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env!")
	}

	// If the config directory doesn't already contain the support files, unpack them
	rebed.Patch(supportFiles, config.Default())

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:         "Uplink",
		Width:         900,
		Height:        600,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
