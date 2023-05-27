package backend

import (
	"bytes"
	"fmt"
	"strings"
	"time"
)

func (a *App) GetLogs() []string {
	a.CreateLogEntry("App", "Logs fetched")
	return a.logs
}

func (a *App) CreateLogEntry(origin string, message string) {
	timestamp := time.Now().Format("15:04:05")

    fmt.Printf("[%s][%s] %s\n", timestamp, origin, message)

    // neither of these are mutexes but honestly it doesn't matter
    // DFU outputs very slowly and it's okay if one or two lines get mixed up as it's not sensitive
	a.logs = append(a.logs, fmt.Sprintf("[%s][%s] %s", timestamp, origin, message))

    if strings.Contains(origin, "DFU") {
        a.dfuOutput = append(a.dfuOutput, fmt.Sprintf("%s", message))
    }
}

// Wails does not provide a way to stream data back to the frontend currently so we just use a var here
func (a *App) GetDFULogs() []string {
    return a.dfuOutput
}

// SCANNER UTILITY FUNCTIONS

// dropCR drops a terminal \r from the data.
func dropCR(data []byte) []byte {
	if len(data) > 0 && data[len(data)-1] == '\r' {
		return data[0 : len(data)-1]
	}
	return data
}

// ScanCRLF scans to the next \r or \n delimiter. Allows updates for DFU.
func ScanCRLF(data []byte, atEOF bool) (advance int, token []byte, err error) {
	if atEOF && len(data) == 0 {
		return 0, nil, nil
	}

	if i := bytes.IndexAny(data, "\r\n"); i >= 0 {
		// We have a full newline-terminated line.
		return i + 1, dropCR(data[0:i]), nil
	}
	// If we're at EOF, we have a final, non-terminated line. Return it.
	if atEOF {
		return len(data), dropCR(data), nil
	}
	// Request more data.
	return 0, nil, nil
}
