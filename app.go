package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx             context.Context
	DddgPath        string `json:"dddgPath"`
	MountedPackPath string `json:"mountedPackPath"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.DddgPath = seekDddgPath()

	if a.DddgPath == "" {
		a.UpdateDddgPath()
	}
}

func seekDddgPath() string {
	configDir, err := os.UserConfigDir()
	if err == nil {
		path := configDir + "/dddg-desktop-version"
		stat, err := os.Stat(path)

		if err == nil && stat.IsDir() {
			return path
		}
	}
	return ""
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetDddgPath() string {
	return a.DddgPath
}

func (a *App) TriggerCoreStateUpdate() {
	runtime.EventsEmit(a.ctx, "coreStateChanged", a)
}

func (a *App) MountPack(id string) {
	a.MountedPackPath = id
	a.TriggerCoreStateUpdate()
}

func (a *App) UpdateDddgPath() {
	x, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory:           a.DddgPath,
		DefaultFilename:            "",
		Title:                      "Select DDDG location",
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		ResolvesAliases:            false,
		TreatPackagesAsDirectories: false,
	})
	if err != nil {
		panic("Cannot select dir")
	}
	a.DddgPath = x
	a.TriggerCoreStateUpdate()
}

type Pack struct {
	Id string `json:"id"`
}

func (a *App) GetPacks() ([]Pack, error) {
	if a.DddgPath == "" {
		return nil, errors.New("no pack installed")
	}
	entries, err := os.ReadDir(a.DddgPath + "/localRepo")
	if err != nil {
		return nil, err
	}

	var ret []Pack
	for _, file := range entries {
		if !file.IsDir() {
			continue
		}
		ret = append(ret, Pack{
			Id: file.Name(),
		})
	}
	fmt.Printf("%+v\n", ret)
	return ret, nil
}
