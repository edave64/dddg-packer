import type { IPack, ISupportedRepo } from "@/repo";
import { go, useParams } from "@/router";
import type {
	JSONPoseMeta,
	JSONHeadCollection as V1HeadCollection,
	JSONCharacter as V1Json,
	JSONStyle as V1Style,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type {
	JSONBackground,
	JSONCharacter,
	JSONHeadCollection,
	JSONPose,
	JSONSprite,
	JSONStyle,
	JSONStyleGroup,
	JSONContentPack as V2Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { saveFile } from "./core-state";
import { useNormalizedDependecyTree } from "./dependencies";
import type { HeadDummy } from "./head-dummy";

const p: Ref<null | ComputedRef<Record<string, string>>> = ref(null);
const params = computed(() => p.value?.value ?? ({} as Record<string, string>));

export function bindParams() {
	p.value = useParams();
}

const repoChanges = ref(false);
const packChanges = ref(false);

export function touchRepo() {
	repoChanges.value = true;
}

export function touchPack() {
	packChanges.value = true;
}

export const hasRepoChanges = computed(() => repoChanges.value);
export const hasPackChanges = computed(() => packChanges.value);

export const hasChanges = computed(
	() => repoChanges.value || packChanges.value,
);

const activePack = ref(null as null | V1Extended | V2Fixed);
const activeRepo = ref(null as null | ISupportedRepo);

export interface V1Extended extends V1Json<HeadDummy> {
	dependencies?: string[];
}

// @ts-expect-error: Broke type definition, fix that in the npm pack
export interface V2Fixed extends V2Json {
	dependencies?: string[];
}

const packId = computed(() => params.value.packId as string | undefined);
export function usePackId() {
	return packId;
}

const pack = computed(() => activePack.value);
export function useActivePack() {
	return pack;
}

const repo = computed(() => activeRepo.value);
export function useActiveRepo() {
	return repo;
}

watch(
	pack,
	(newPack, oldPack) => {
		if (newPack === oldPack) {
			touchPack();
		}
	},
	{ deep: true },
);

watch(
	repo,
	(newRepo, oldRepo) => {
		if (newRepo === oldRepo) {
			touchRepo();
		}
	},
	{ deep: true },
);

export function isV2(pack: V1Json<HeadDummy> | V2Fixed): pack is V2Fixed {
	return "version" in pack;
}

const character = computed(() => {
	const charId = params.value.charId as string | undefined;
	if (charId === undefined) return undefined;

	const pack = activePack.value;
	if (pack === null || !isV2(pack)) return undefined;

	return pack.characters?.find((x) => x.id === charId);
});

export function useCharacter(): ComputedRef<JSONCharacter | undefined> {
	return character;
}

const headGroup = computed(() => {
	const headGroupId = params.value.headGroupId as string | undefined;
	if (headGroupId === undefined) return undefined;

	const character = useCharacter().value;
	if (character === undefined) return undefined;

	const headGroup = character.heads?.[headGroupId];
	if (headGroup === undefined) return undefined;

	if (Array.isArray(headGroup)) {
		return {
			variants: headGroup,
		};
	}

	return headGroup;
});

export function useHeadGroup(): ComputedRef<JSONHeadCollection | undefined> {
	return headGroup;
}

const headGroupV1 = computed<V1HeadCollection | undefined>(() => {
	const headGroupId = params.value.headGroupId as string | undefined;
	if (headGroupId === undefined) return undefined;

	const character = useCharacterV1().value;
	if (character === undefined) return undefined;

	const headGroup = character.heads?.[headGroupId];
	if (headGroup === undefined) return undefined;

	if (Array.isArray(character.heads?.[headGroupId])) {
		return {
			all: character.heads?.[headGroupId],
		};
	}

	return character.heads?.[headGroupId];
});

export function useHeadGroupV1(): ComputedRef<V1HeadCollection | undefined> {
	return headGroupV1;
}

const styleGroup = computed(() => {
	const styleGroupId = params.value.styleGroupId as string | undefined;
	if (styleGroupId === undefined) return undefined;

	const character = useCharacter().value;
	if (character === undefined) return undefined;

	return character.styleGroups?.find((x) => x.id === styleGroupId);
});

export function useStyleGroup(): ComputedRef<JSONStyleGroup | undefined> {
	return styleGroup;
}

const style = computed(() => {
	const styleId = params.value.styleId as string | undefined;
	if (styleId === undefined) return undefined;

	const styleGroup = useStyleGroup().value;
	if (styleGroup === undefined) return undefined;

	return styleGroup.styles?.[Number.parseInt(styleId, 10)];
});

export function useStyle(): ComputedRef<JSONStyle | undefined> {
	return style;
}

const pose = computed(() => {
	const poseId = params.value.poseId as string | undefined;
	if (poseId === undefined) return undefined;

	const style = useStyle().value;
	if (style === undefined) return undefined;

	return style.poses.find((x) => x.id === poseId);
});

export function usePose(): ComputedRef<JSONPose | undefined> {
	return pose;
}

const styleV1 = computed(() => {
	const styleId = params.value.styleId;
	if (styleId === undefined) return undefined;

	const charV1 = useCharacterV1().value;
	if (charV1 === undefined) return undefined;

	return charV1.styles?.find((x) => x.name === styleId);
});

export function useStyleV1(): ComputedRef<V1Style | undefined> {
	return styleV1;
}

const poseV1 = computed(() => {
	const poseId = params.value.poseId as string | undefined;
	if (poseId === undefined) return undefined;

	const charV1 = useCharacterV1().value;
	if (charV1 === undefined) return undefined;

	return charV1.poses?.find((x) => x.name === poseId);
});

export function usePoseV1(): ComputedRef<JSONPoseMeta<HeadDummy> | undefined> {
	return poseV1;
}

const background = computed(() => {
	const pack = activePack.value;
	const backgroundId = params.value.backgroundId as string | undefined;
	if (pack === null || !isV2(pack)) return undefined;
	if (backgroundId === undefined) return undefined;
	return pack.backgrounds?.find((x) => x.id === backgroundId);
});

export function useBackground(): ComputedRef<JSONBackground | undefined> {
	return background;
}

const sprite = computed(() => {
	const pack = activePack.value;
	const spriteId = params.value.spriteId as string | undefined;
	if (pack === null || !isV2(pack)) return undefined;
	if (spriteId === undefined) return undefined;
	return pack.sprites?.find((x) => x.id === spriteId);
});

export function useSprite(): ComputedRef<JSONSprite | undefined> {
	return sprite;
}

let currentLoadI = 0;
watch(
	packId,
	async (id: string | undefined) => {
		const loadI = ++currentLoadI;
		activePack.value = null;
		activeRepo.value = null;

		if (id === undefined) return;

		try {
			const [repoJSON, indexJSON] = await Promise.all([
				(async () => await (await fetch(`/packs/${id}/repo.json`)).json())(),
				(async () => await (await fetch(`/packs/${id}/index.json`)).json())(),
			]);

			// Another load was triggered. Don't apply the result.
			if (loadI !== currentLoadI) return;

			activePack.value = indexJSON;
			activeRepo.value = repoJSON;
			repoChanges.value = false;
			packChanges.value = false;
		} catch (_) {
			// Another load was triggered. Don't apply the result.
			if (loadI !== currentLoadI) return;

			// TODO: Report error to user!
			// TODO: Also, this might mean the folder was deleted in the mean time.
			//       Maybe reload the pack list?
			// We couldn't load the pack. Redirect to the pack selection screen.
			go("select-pack");
		}
	},
	{ immediate: true },
);

const characterV1 = computed<V1Json<HeadDummy> | undefined>(() => {
	const charId = params.value.charId as string | undefined;
	if (charId === undefined) return undefined;

	const pack = activePack.value;
	if (pack === null || isV2(pack)) return undefined;

	return pack;
});

export function useCharacterV1(): ComputedRef<V1Json<HeadDummy> | undefined> {
	return characterV1;
}

function normalizeRepoPath(path: string): string {
	const packIdV = packId.value;
	if (!packIdV) return path;
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path.substring(path.indexOf(packIdV) + packIdV.length + 1);
	}
	return path;
}

function getPackJsonPath(repoJSON: IPack): string {
	if (repoJSON.dddg1Path && repoJSON.dddg2Path) {
		throw new Error("Cannot load dual pack");
	}

	const path = repoJSON.dddg2Path ?? repoJSON.dddg1Path;
	if (path == null) {
		throw new Error("No a DDDG pack");
	}
	return normalizeRepoPath(path);
}

export async function save() {
	const repoV = repo.value;
	if (!repoV) return;

	if (hasPackChanges.value || hasRepoChanges.value) {
		await saveRepo(repoV);
	}
	if (hasPackChanges.value) {
		await savePack(repoV);
	}
}

export async function saveRepo(repoV: ISupportedRepo) {
	repoV.$schema =
		"https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json";

	// Update pack kinds
	const packV = pack.value;
	repoV.pack.kind = packV ? getPackKinds(packV) : [];

	// Normalize authors
	const authors = new Set([...repoV.pack.authors, ...(packV?.authors ?? [])]);
	repoV.pack.authors = [...authors];
	if (packV) {
		packV.authors = [...authors];
	}
	for (const key in repoV.authors) {
		if (!authors.has(key)) delete repoV.authors[key];
	}

	// Character names
	repoV.pack.characters = packV ? getPackCharacters(packV) : [];

	await saveFile("repo.json", JSON.stringify(repoV, undefined, "\t"));
	repoChanges.value = false;
}

export async function savePack(repoV: ISupportedRepo) {
	await saveFile(
		getPackJsonPath(repoV.pack),
		JSON.stringify(pack.value, undefined, "\t"),
	);
	packChanges.value = false;
}

function getPackCharacters(pack: V1Json<HeadDummy> | V2Fixed): string[] {
	if (isV2(pack)) {
		const dependencies = useNormalizedDependecyTree().value;

		return (
			pack.characters?.map((char) => {
				if (char.label) return char.label;
				const depChar = dependencies.characters.find((c) => c.id === char.id);
				if (depChar?.label) return depChar.label;

				const labelPart = char.id.split(".").at(-1)!;
				return labelPart[0].toUpperCase() + labelPart.slice(1);
			}) ?? []
		);
	} else {
		if (pack.name) return [pack.name];

		const basicName = {
			"ddlc.monika": "Monika",
			"ddlc.natsuki": "Natsuki",
			"ddlc.sayori": "Sayori",
			"ddlc.yuri": "Yuri",
			"ddlc.fan.mc1": "MC",
			"ddlc.fan.mc2": "MC",
			"ddlc.fan.mc_chad": "MC (Chad)",
			"ddlc.fan.femc": "FeMC",
			"ddlc.fan.amy1": "Amy",
			"ddlc.fan.amy2": "Amy",
		}[pack.id];
		if (basicName) return [basicName];

		const labelPart = pack.id.split(".").at(-1)!;
		return [labelPart[0].toUpperCase() + labelPart.slice(1)];
	}
}

enum PackClassification {
	Characters = 1,
	Poses = 2,
	Styles = 4,
	Expressions = 8,
	Backgrounds = 16,
	Sprites = 32,
}

function getPackKinds(
	pack: V1Json<HeadDummy> | V2Fixed,
): (keyof typeof PackClassification)[] {
	const classification = classifyPack(pack);
	return (
		Object.keys(PackClassification) as (keyof typeof PackClassification)[]
	).filter((key) => {
		return (classification & PackClassification[key]) !== 0;
	});
}

function classifyPack(
	pack: V1Json<HeadDummy> | V2Fixed,
): 0 | PackClassification {
	if ("version" in pack) {
		return classifyPackV2(pack);
	} else {
		return classifyPackV1(pack);
	}
}

function classifyPackV1(pack: V1Json<HeadDummy>): 0 | PackClassification {
	let ret: 0 | PackClassification = 0;

	// Specifying the label of a character inside an extension would be very irregular
	if (pack.name) return PackClassification.Characters;

	if (pack.heads && Object.keys(pack.heads).length > 0) {
		ret |= PackClassification.Expressions;
	}
	if (pack.styles && pack.styles.length > 0) {
		ret |= PackClassification.Styles;
	}
	if (pack.poses && pack.poses.length > 0) {
		for (const pose of pack.poses) {
			if (!pack.styles?.find((x) => x.name === pose.style)) {
				// We only classify it as a pose pack if the poses it contains are not part
				// of the styles it defines.
				ret |= PackClassification.Poses;
			}
		}
	}
	return ret;
}

function classifyPackV2(pack: V2Fixed): 0 | PackClassification {
	let ret: 0 | PackClassification = 0;

	if (pack.characters) {
		for (const char of pack.characters) {
			ret |= classifyChar(char);
		}
	}
	if (pack.backgrounds) {
		ret |= PackClassification.Backgrounds;
	}
	if (pack.sprites) {
		ret |= PackClassification.Sprites;
	}

	return ret;
}

function classifyChar(char: JSONCharacter): PackClassification {
	if (!char.id.includes(":")) {
		// Does not extend an existing character
		return PackClassification.Characters;
	}
	let ret = 0;
	for (const styleGroup of char.styleGroups ?? []) {
		if (!styleGroup.id.includes(":")) {
			ret |= PackClassification.Styles;
		} else {
			// A style group that extends an existing one can only add poses or styles.
			// And style extensions are hard to detect and rare. TODO
			ret |= PackClassification.Poses;
		}
	}
	if (char.heads && Object.keys(char.heads).length > 0) {
		ret |= PackClassification.Expressions;
	}
	return ret;
}
