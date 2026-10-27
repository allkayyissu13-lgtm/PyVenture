//go:build !linux

package learning

import "os"

// Di Windows/macOS pengukuran memori belum didukung; UI cukup menampilkan "-".
func maxRSSKB(*os.ProcessState) int64 { return 0 }
