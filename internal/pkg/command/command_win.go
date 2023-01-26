//go:build windows

package command

import (
	"os/exec"
	"syscall"
)

// Command returns an exec.Command
func Command(name string, arg ...string) *exec.Cmd {
	cmd := exec.Command(name, arg...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	return cmd
}
