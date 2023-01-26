//go:build !windows

// Package command provides a wrapper for exec.Command with os-specific flags.
package command

import "os/exec"

func Command(name string, arg ...string) *exec.Cmd {
	return exec.Command(name, arg...)
}
