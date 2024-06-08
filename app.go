package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"runtime"

	wails_runtime "github.com/wailsapp/wails/v2/pkg/runtime"
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
	wails_runtime.EventsEmit(a.ctx, "coreStateChanged", a)
}

func (a *App) MountPack(id string) {
	a.MountedPackPath = id
	a.TriggerCoreStateUpdate()
}

// This is temporary until I get the PUT handler to work
func (a *App) UploadFile(mountedPath string, contents []byte) {
	fi, err := os.Create(path.Join(a.DddgPath, "localRepo", a.MountedPackPath, mountedPath))
	if err == nil {
		// close fi on exit and check for its returned error
		defer func() {
			if err := fi.Close(); err != nil {
				panic(err)
			}
		}()

		fmt.Printf("a %+v\n", fi)

		fi.Write(contents)
	} else {
		fmt.Printf("%+v\n", err)
	}
}

func (a *App) UpdateDddgPath() {
	x, err := wails_runtime.OpenDirectoryDialog(a.ctx, wails_runtime.OpenDialogOptions{
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

func (a *App) Confirm(text string, title string) bool {
	x, err := wails_runtime.MessageDialog(a.ctx, wails_runtime.MessageDialogOptions{
		Title:         title,
		Message:       text,
		Type:          wails_runtime.QuestionDialog,
		Buttons:       []string{"Yes", "No"},
		DefaultButton: "No",
	})
	if err != nil {
		panic("Confirm dialog broken")
	}
	return x == "Yes"
}

func (a *App) Alert(text string, title string) {
	_, err := wails_runtime.MessageDialog(a.ctx, wails_runtime.MessageDialogOptions{
		Title:         title,
		Message:       text,
		Type:          wails_runtime.InfoDialog,
		Buttons:       []string{"Ok"},
		DefaultButton: "Ok",
	})
	if err != nil {
		panic("Confirm dialog broken")
	}
}

func (a *App) CreatePack(id string, repoBody string, indexBody string) error {
	basePath := path.Join(a.DddgPath, "localRepo", id)
	if err := os.Mkdir(basePath, os.ModePerm); err != nil {
		return err
	}

	fiRepo, err := os.Create(path.Join(basePath, "repo.json"))
	if err != nil {
		return err
	}

	// close fi on exit and check for its returned error
	defer func() {
		if err := fiRepo.Close(); err != nil {
			panic(err)
		}
	}()

	fiRepo.Write([]byte(repoBody))

	fiIndex, err := os.Create(path.Join(basePath, "index.json"))
	if err != nil {
		return err
	}

	// close fi on exit and check for its returned error
	defer func() {
		if err := fiIndex.Close(); err != nil {
			panic(err)
		}
	}()

	fiIndex.Write([]byte(indexBody))
	return nil
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

func (a *App) OpenFolder() error {
	if a.DddgPath == "" {
		return errors.New("no DDDG path set")
	}
	if a.MountedPackPath == "" {
		return errors.New("no pack path set")
	}
	targetPath := path.Join(a.DddgPath, "localRepo", a.MountedPackPath)
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("explorer", "/select,"+targetPath)
	} else if runtime.GOOS == "darwin" {
		cmd = exec.Command("open", targetPath)
	} else {
		cmd = exec.Command("xdg-open", targetPath)
	}
	err := cmd.Start()
	if err != nil {
		return err
	}
	return nil
}
