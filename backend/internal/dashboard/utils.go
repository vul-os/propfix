package dashboard

import (
	"embed"
	"path/filepath"
)

//go:embed sql
var sqlFiles embed.FS

func ProcessFile(name string) string {
	extension := ".sql"

	filename := name + extension
	filepath := filepath.Join("sql", filename)

	fileContents, err := sqlFiles.ReadFile(filepath)
	if err != nil {
		// Handle error reading file
		return ""
	}
	return string(fileContents)
}
