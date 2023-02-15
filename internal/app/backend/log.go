package backend

import (
	"fmt"
	"time"
)

func (a *App) GetLogs() []string {
	a.CreateLogEntry("App", "Logs fetched")
	return a.logs
}

func (a *App) CreateLogEntry(origin string, message string) {
	timestamp := time.Now().Format("15:04:05")
	a.logs = append(a.logs, fmt.Sprintf("[%s][%s] %s", timestamp, origin, message))
}
