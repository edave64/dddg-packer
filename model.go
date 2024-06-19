package main

type Pack struct {
	Id          string   `json:"id"`
	Name        string   `json:"name"`
	Source      string   `json:"source"`
	Description string   `json:"description"`
	DDDG1Path   string   `json:"dddg1Path"`
	DDDG2Path   string   `json:"dddg2Path"`
	Preview     []string `json:"preview"`
	Characters  []string `json:"characters"`
	Authors     []string `json:"authors"`
	Kind        []string `json:"kind"`
}

type Author struct {
	Reddit     string `json:"reddit"`
	Twitter    string `json:"twitter"`
	Github     string `json:"github"`
	Website    string `json:"website"`
	Pixiv      string `json:"pixiv"`
	DeviantArt string `json:"deviantart"`
	Patreon    string `json:"patreon"`
	Facebook   string `json:"facebook"`
	Discord    string `json:"discord"`
}

type SingleRepoJson struct {
	Pack    Pack              `json:"pack"`
	Authors map[string]Author `json:"authors"`
}

type MultiRepoJson struct {
	Packs   []Pack            `json:"packs"`
	Authors map[string]Author `json:"authors"`
}
