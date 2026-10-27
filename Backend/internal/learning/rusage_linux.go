//go:build linux

package learning

import (
	"os"
	"syscall"
)

// maxRSSKB membaca puncak memori proses anak (Linux melaporkan dalam KB).
func maxRSSKB(ps *os.ProcessState) int64 {
	if ps == nil {
		return 0
	}
	if ru, ok := ps.SysUsage().(*syscall.Rusage); ok {
		return int64(ru.Maxrss)
	}
	return 0
}
