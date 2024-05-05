package main

import (
	"embed"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
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
	mountedPath, isMountedPath := strings.CutPrefix(r.RequestURI, "/mountedPack")
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
	fi, err := os.Open(path.Join(handler.app.DddgPath, "localRepo", handler.app.MountedPackPath, mountedPath))
	if err == nil {
		// close fi on exit and check for its returned error
		defer func() {
			if err := fi.Close(); err != nil {
				panic(err)
			}
		}()

		io.Copy(rw, fi)
	} else {
		fmt.Printf("%+v\n", err)
		rw.WriteHeader(http.StatusNotFound)
	}
}

func (handler *DynamicAssetHandler) ServeMountedPut(rw http.ResponseWriter, r *http.Request, mountedPath string) {
	rw.WriteHeader(http.StatusNotImplemented)
}
