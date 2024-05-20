package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "dddg-packer",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
			Handler: &DynamicAssetHandler{
				app: app,
			},
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

type DynamicAssetHandler struct {
	app *App
}

func (handler *DynamicAssetHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	println(r.RequestURI)
	mountedPath, isMountedPath := strings.CutPrefix(r.URL.Path, "/mountedPack")
	if isMountedPath {
		handler.ServeMounted(rw, r, mountedPath)
	}
}

func (handler *DynamicAssetHandler) ServeMounted(rw http.ResponseWriter, r *http.Request, mountedPath string) {
	if handler.app.MountedPackPath != "" {
		if r.Method == "GET" {
			handler.ServeMountedGet(rw, r, mountedPath)
		}
		if r.Method == "PUT" {
			handler.ServeMountedPut(rw, r, mountedPath)
		}
	} else {
		fmt.Printf("Cannot load %+v since no pack is mounted\n", r.RequestURI)
		rw.WriteHeader(http.StatusExpectationFailed)
	}
}

func (handler *DynamicAssetHandler) ServeMountedGet(rw http.ResponseWriter, r *http.Request, mountedPath string) {
	rw.Header().Add("Cache-Control", "no-cache")
	dirPath, isDirPath := strings.CutSuffix(mountedPath, "/*.json")
	if isDirPath {
		path := path.Join(handler.app.DddgPath, "localRepo", handler.app.MountedPackPath, dirPath)
		fileInfo, err := buildFileInfo(path)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}

		// Convert to JSON
		jsonData, err := json.Marshal(fileInfo)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}

		// Write JSON to ResponseWriter
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		rw.Write(jsonData)
		return
	}

	path := path.Join(handler.app.DddgPath, "localRepo", handler.app.MountedPackPath, mountedPath)
	fi, err := os.Open(path)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusNotFound)
		return
	}
	// close fi on exit and check for its returned error
	defer func() {
		if err := fi.Close(); err != nil {
			panic(err)
		}
	}()

	io.Copy(rw, fi)

}

func (handler *DynamicAssetHandler) ServeMountedPut(rw http.ResponseWriter, r *http.Request, mountedPath string) {
	err := r.ParseMultipartForm(100 << 20)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	reqFile, _, err := r.FormFile("data")
	if err != nil {
		http.Error(rw, err.Error(), http.StatusBadRequest)
		return
	}
	fi, err := os.Create(path.Join(handler.app.DddgPath, "localRepo", handler.app.MountedPackPath, mountedPath))
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	// close fi on exit and check for its returned error
	defer func() {
		if err := fi.Close(); err != nil {
			panic(err)
		}
	}()

	fmt.Printf("a %+v\n", fi)
	fmt.Printf("b %+v\n", reqFile)

	io.Copy(fi, reqFile)
}

type FileInfo struct {
	Name     string     `json:"name"`
	IsDir    bool       `json:"isDir"`
	Children []FileInfo `json:"children,omitempty"`
}

func buildFileInfo(dirPath string) (FileInfo, error) {
	var fileInfo FileInfo
	fileInfo.Name = filepath.Base(dirPath)
	fileInfo.IsDir = true

	// Get the list of files and directories in the provided directory
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return FileInfo{}, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			// Recursively build FileInfo for directories
			childFileInfo, err := buildFileInfo(filepath.Join(dirPath, entry.Name()))
			if err != nil {
				return FileInfo{}, err
			}
			fileInfo.Children = append(fileInfo.Children, childFileInfo)
		} else {
			// For files, just add the file info
			fileInfo.Children = append(fileInfo.Children, FileInfo{
				Name:  entry.Name(),
				IsDir: false,
			})
		}
	}

	return fileInfo, nil
}
