package backend

import (
	"encoding/json"
	"io"
	"net/http"
)

// FetchPacks downloads the sounds.json and scripts.json files from the EdgeTX repo and returns the list of packs.
func (a *App) FetchPacks() FetchPacksResponse {
	a.CreateLogEntry("SD", "Fetching packs...")

	var languages []Language
	var scripts []Script

	err := getAndUnmarshalTo("https://github.com/EdgeTX/edgetx-sdcard-sounds/releases/download/latest/sounds.json", &languages)
	if err != nil {
		a.CreateLogEntry("SD", "Error fetching language packs: "+err.Error())
		return FetchPacksResponse{nil, nil, &ErrorWrapper{err.Error()}}
	}

	err = getAndUnmarshalTo("https://github.com/EdgeTX/lua-scripts/releases/download/latest/scripts.json", &scripts)
	if err != nil {
		a.CreateLogEntry("SD", "Error fetching scripts: "+err.Error())
		return FetchPacksResponse{nil, nil, &ErrorWrapper{err.Error()}}
	}

	a.CreateLogEntry("SD", "Fetched packs successfully.")

	return FetchPacksResponse{languages, scripts, nil}
}

func getAndUnmarshalTo[T any](url string, v *T) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	json.Unmarshal(body, &v)
	return nil
}

// Language is deserialized from the language packs JSON file.
type Language struct {
	Language    string `json:"language"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Directory   string `json:"directory"`
}

// Script is deserialized from the script packs JSON file.
type Script struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Filename    string `json:"filename"`
	UnpackTo    string `json:"unpack_to"`
	UnpackFrom  string `json:"unpack_from"`
	InfoUrl     string `json:"info_url"`
	Default     bool   `json:"default"`
	Official    bool   `json:"official"`
}

// FetchPacksResponse is the response from the FetchPakcs method.
type FetchPacksResponse struct {
	Languages []Language    `json:"languages"`
	Scripts   []Script      `json:"scripts"`
	Error     *ErrorWrapper `json:"error,omitempty"`
}
