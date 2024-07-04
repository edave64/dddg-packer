import { ref } from "vue";
import type { IPack, IRepo } from "../repo";
import { all } from "@microsoft/fast-foundation";
import { GetPacks, GetRepoJson } from "@wails/go/main/App";

export const Repo = {
	allPacks: ref<IPack[]>([
		// Packs included with dddg
		{
			id: "dddg.buildin.base.monika",
			name: "Monika",
			description: "Monika",
			authors: [],
			characters: ["Monika"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.base.monika.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.sayori",
			name: "Sayori",
			description: "Sayori",
			authors: [],
			characters: ["Sayori"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.base.sayori.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.base.natsuki",
			name: "Natsuki",
			description: "Natsuki",
			authors: [],
			characters: ["Natsuki"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.base.natsuki.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.yuri",
			name: "Yuri",
			description: "Yuri",
			authors: [],
			characters: ["Yuri"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.base.yuri.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.mc",
			name: "MC",
			description: "MC",
			authors: [],
			characters: ["MC"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.base.mc.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.concept_mc",
			name: "Concept MC",
			description: "MC",
			authors: [],
			characters: ["MC"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.concept_mc.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.mc_chad",
			name: "Chad MC",
			description: "MC",
			authors: [],
			characters: ["MC"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.mc_chad.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.femc",
			name: "FeMC",
			description: "FeMC",
			authors: [],
			characters: ["FeMC"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.femc.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.concept_femc",
			name: "Concept FeMC",
			description: "FeMC",
			authors: [],
			characters: ["FeMC"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.concept_femc.json",
			kind: ["Characters"],
		},
		{
			id: "dddg.buildin.amy2",
			name: "Amy",
			description: "Amy",
			authors: [],
			characters: ["Amy"],
			preview: [],
			source: "",
			dddg2Path:
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.amy.json",
			kind: ["Characters"],
		},
	]),

	async load(url: string) {
		const packs: IPack[] = await (await fetch(url)).json();
		const root = `${new URL("..", url).toString()}/`;
		for (const pack of packs) {
			if (pack.dddg1Path) {
				pack.dddg1Path = pack.dddg1Path.replace(/^\.\//, root);
			}
			if (pack.dddg2Path) {
				pack.dddg2Path = pack.dddg2Path.replace(/^\.\//, root);
			}
			if (pack.preview) {
				pack.preview = pack.preview.map((p) => p.replace(/^\.\//, root));
			}
		}
		this.allPacks.value = [...this.allPacks.value, ...packs];
	},
	async loadAllInstalled() {
		const packFolders = await GetRepoJson();
		this.allPacks.value = [
			...this.allPacks.value,
			...(packFolders.packs as unknown as IPack[]),
		];
	},
};

Repo.load(
	"https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/repo.json",
);
Repo.loadAllInstalled();
