import { GetRepoJson } from "@wails/go/main/App";
import { computed, reactive, ref } from "vue";
import type { IPack } from "../repo";

export const Repo = {
	basePacks: ref<IPack[]>([
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
				"https://edave64.github.io/Doki-Doki-Dialog-Generator/release/packs/buildin.extra.concept_mc_v2.json",
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
	// List of authors
	baseAuthors: ref<Record<string, IAuthor>>({
		Satchely: {
			deviantart: "satchely",
			pixiv: "1104770",
			twitter: "_Satchely",
			tumblr: "satchely",
			bluesky: "satchely.bsky.social",
		},
		Fatelogic: {
			deviantart: "fatelogic",
			patreon: "fatelogic",
			twitter: "Fatelogic",
			tumblr: "fatelogic",
		},
		Hadrosaur838: {
			deviantart: "hadrosaur838",
			reddit: "Hadrosaur838",
		},
		"Meddy-sin": {
			reddit: "meddy-sin",
		},
		SlightlySimple: {
			reddit: "SlightlySimple",
		},
		StormBlazed76: {
			discord: "Storm Blaze#7530",
			reddit: "StormBlazed76",
		},
	}),

	repoPacks: reactive({} as Record<string, IPack[]>),
	repoAuthors: reactive({} as Record<string, Record<string, IAuthor>>),

	localPacks: ref<IPack[]>([]),
	localAuthors: ref<Record<string, IAuthor>>({}),

	allPacks: computed((): IPack[] => {
		const deduplicated: Record<string, IPack> = {};

		// JS objects preserve insertion order, so this ensures the overall order is
		// preserved, while also letting the latest pack override any previous ones
		for (const pack of [
			...Repo.basePacks.value,
			...Object.values(Repo.repoPacks).flat(),
			...Repo.localPacks.value,
		]) {
			deduplicated[pack.id] = pack;
		}
		return Object.values(deduplicated);
	}),

	allAuthors: computed((): Record<string, IAuthor> => {
		const out: Record<string, IAuthor> = {};
		for (const authorSource of [
			Repo.baseAuthors.value,
			...Object.values(Repo.repoAuthors),
			Repo.localAuthors.value,
		]) {
			if (!authorSource) continue;
			for (const [name, author] of Object.entries(authorSource)) {
				if (out[name]) {
					out[name] = { ...out[name], ...author };
				} else {
					out[name] = author;
				}
			}
		}
		return out;
	}),

	async loadPacks(url: string) {
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
		this.repoPacks[url] = packs;
	},
	async loadAuthors(url: string) {
		const authors: Record<string, IAuthor> = await (await fetch(url)).json();
		this.repoAuthors[url] = authors;
	},
	async loadAllInstalled() {
		const multipack = await GetRepoJson();
		this.localPacks.value = multipack.packs as IPack[];
		this.localAuthors.value = multipack.authors as Record<string, IAuthor>;
	},
};

Repo.loadPacks(
	"https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/repo.json",
);
Repo.loadAuthors(
	"https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/people.json",
);
Repo.loadAllInstalled();

export interface IAuthor {
	reddit?: string;
	twitter?: string;
	github?: string;
	website?: string;
	pixiv?: string;
	deviantart?: string;
	patreon?: string;
	facebook?: string;
	discord?: string;
	tumblr?: string;
	bluesky?: string;
}
