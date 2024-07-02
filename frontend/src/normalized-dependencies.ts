import type * as V2 from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Repo } from "./repo/repo";
import type * as V1 from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type { HeadDummy } from "./components/pack-v1/headDummy";
import type { Style } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";

export type V1Pack = V1.JSONCharacter<HeadDummy>;
export type V2Pack = V2.JSONContentPack;

export async function loadPack(
	packId: string,
): Promise<V1Pack | V2Pack | null> {
	const pack = Repo.allPacks.value.find((p) => p.id === packId);
	if (!pack) return null;

	if (!pack.dddg2Path && !pack.dddg1Path) return null;
	return await (await fetch(pack.dddg2Path ?? pack.dddg1Path ?? "")).json();
}

export function generateEmptyPack(): INormalizedPack {
	return {
		backgrounds: [],
		sprites: [],
		characters: [],
	};
}

export function normalizePack(
	pack: V1Pack | V2Pack | null,
): INormalizedPack | null {
	if (!pack) return null;
	if (!("version" in pack)) {
		return normalizePackV1(pack);
	}
	return normalizePackV2(pack);
}

export function mergePacks(
	packA: INormalizedPack,
	packB: INormalizedPack,
): INormalizedPack {
	return {
		characters: mergeCharacters(packA.characters, packB.characters),
		backgrounds: mergeObjectLists(packA.backgrounds, packB.backgrounds),
		sprites: mergeObjectLists(packA.sprites, packB.sprites),
	};

	function mergeCharacters(
		charactersA: INormalizedCharacter[],
		charactersB: INormalizedCharacter[],
	): INormalizedCharacter[] {
		const ret = [...charactersA];
		for (const character of charactersB) {
			const idx = ret.findIndex((x) => x.id === character.id);
			if (idx === -1) {
				ret.push(structuredClone(character));
			} else {
				ret[idx] = mergeCharacter(ret[idx], character);
			}
		}
		return ret;
	}

	function mergeCharacter(
		characterA: INormalizedCharacter,
		characterB: INormalizedCharacter,
	): INormalizedCharacter {
		const ret = structuredClone(characterA);
		if (ret.id !== characterB.id)
			throw new Error("Cannot merge characters with different ids");
		if (ret.label === ret.id) ret.label = characterB.label;
		ret.headGroups = mergeObjectLists(ret.headGroups, characterB.headGroups);
		ret.styleGroups = mergeStyleGroups(ret.styleGroups, characterB.styleGroups);
		return ret;
	}

	function mergeStyleGroups(
		styleGroupsA: INormalizedStyleGroup[],
		styleGroupsB: INormalizedStyleGroup[],
	): INormalizedStyleGroup[] {
		const ret = [...styleGroupsA];
		for (const styleGroup of styleGroupsB) {
			const idx = ret.findIndex((x) => x.id === styleGroup.id);
			if (idx === -1) {
				ret.push(structuredClone(styleGroup));
			} else {
				ret[idx] = mergeStyleGroup(ret[idx], styleGroup);
			}
		}
		return ret;
	}

	function mergeStyleGroup(
		styleGroupA: INormalizedStyleGroup,
		styleGroupB: INormalizedStyleGroup,
	): INormalizedStyleGroup {
		const ret = structuredClone(styleGroupA);
		if (ret.id !== styleGroupB.id)
			throw new Error("Cannot merge style groups with different ids");
		if (ret.label === ret.id) ret.label = styleGroupB.label;
		ret.parts = mergeStringLists(ret.parts, styleGroupB.parts);
		ret.styles = mergeStyles(ret.styles, styleGroupB.styles);
		return ret;
	}

	function mergeStyles(
		stylesA: INormalizedStyle[],
		stylesB: INormalizedStyle[],
	): INormalizedStyle[] {
		const ret = [...stylesA];

		for (const style of stylesB) {
			const idx = ret.findIndex((x) => x.id === style.id);
			if (idx === -1) {
				ret.push(structuredClone(style));
			} else {
				ret[idx] = mergeStyle(ret[idx], style);
			}
		}
		return ret;
	}

	function mergeStyle(
		styleA: INormalizedStyle,
		styleB: INormalizedStyle,
	): INormalizedStyle {
		const ret = structuredClone(styleA);
		ret.poses = mergePoses(ret.poses, styleB.poses);
		return ret;
	}

	function mergePoses(
		posesA: INormalizedPose[],
		posesB: INormalizedPose[],
	): INormalizedPose[] {
		const ret = [...posesA];
		for (const pose of posesB) {
			const idx = ret.findIndex((x) => x.id === pose.id);
			if (idx === -1) {
				ret.push(structuredClone(pose));
			} else {
				ret[idx] = mergePose(ret[idx], pose);
			}
		}
		return ret;
	}

	function mergePose(
		poseA: INormalizedPose,
		poseB: INormalizedPose,
	): INormalizedPose {
		const ret = structuredClone(poseA);
		if (ret.id !== poseB.id)
			throw new Error("Cannot merge poses with different ids");
		if (ret.label === ret.id) ret.label = poseB.label;
		ret.positions = mergeStringLists(ret.positions, poseB.positions);
		return ret;
	}

	function mergeObjectLists<T extends INormalizedObject>(
		objectsA: T[],
		objectsB: T[],
	): T[] {
		const ret = [...objectsA];
		for (const object of objectsB) {
			const idx = ret.findIndex((x) => x.id === object.id);
			if (idx === -1) {
				ret.push(structuredClone(object));
			} else {
				ret[idx] = mergeObjects(ret[idx], object);
			}
		}
		return ret;
	}

	function mergeObjects<T extends INormalizedObject>(
		objectA: T,
		objectB: T,
	): T {
		const ret: T = structuredClone(objectA);
		if (ret.id !== objectB.id)
			throw new Error("Cannot merge objects with different ids");
		if (ret.label === ret.id) ret.label = objectB.label;

		for (const key of Object.keys(objectB) as (keyof T)[]) {
			if (key === "id" || key === "label") continue;
			if (ret[key] === undefined) {
				ret[key] = structuredClone(objectB[key]);
				continue;
			}
			const valueRet = ret[key] as unknown;
			const valueObject = objectB[key] as unknown;
			if (Array.isArray(valueRet) && Array.isArray(valueObject)) {
				if (typeof valueRet[0] === "string") {
					// biome-ignore lint/suspicious/noExplicitAny:
					ret[key] = mergeStringLists(valueRet, valueObject) as any;
				} else {
					// biome-ignore lint/suspicious/noExplicitAny:
					ret[key] = mergeObjectLists(valueRet, valueObject) as any;
				}
			}
		}
		return ret;
	}

	function mergeStringLists(listA: string[], listB: string[]): string[] {
		const ret = [...listA];
		for (const value of listB) {
			if (!ret.includes(value)) ret.push(value);
		}
		return ret;
	}
}

export function getStyleId(parts: Record<string, string> | undefined): string {
	if (parts === undefined) return "default";
	const entries = Object.entries(parts);
	if (entries.length === 0) return "default";
	return JSON.stringify(
		Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b))),
	);
}

function normalizePackV1(pack: V1Pack): INormalizedPack {
	const packId = pack.packId ?? "";
	return {
		characters: [normalizeCharacter(pack)],
		backgrounds: [],
		sprites: [],
	};

	function normalizeCharacter(character: V1Pack): INormalizedCharacter {
		return {
			id: namespaceId(packId, character.id),
			label: character.name ?? character.id,
			headGroups: Object.keys(character.heads ?? {}).map((x) => ({
				id: namespaceId(packId, x),
				label: x,
			})),
			styleGroups: character.styles?.map(normalizeStyleGroup) ?? [],
		};
	}

	function normalizeStyleGroup(value: V1.JSONStyle): INormalizedStyleGroup {
		return {
			id: namespaceId(packId, value.name),
			label: value.label,
			parts: [],
			styles: [
				{
					id: "default",
					parts: {},
					poses:
						pack.poses
							?.filter((x) => x.style === value.name)
							.map((x) => ({
								id: namespaceId(packId, x.name),
								label: x.name,
								positions: normalizePositions(x),
							})) ?? [],
				},
			],
		};
	}

	function normalizePositions(pose: V1.JSONPoseMeta<HeadDummy>): string[] {
		const positions: string[] = [];
		if ("left" in pose) positions.push("Left");
		if ("right" in pose) positions.push("Right");
		if ("static" in pose) positions.push("Static");
		if ("variant" in pose) positions.push("Variant");
		return positions;
	}
}

function normalizePackV2(pack: V2Pack): INormalizedPack {
	const packId = pack.packId ?? "";

	return {
		characters: pack.characters?.map(normalizeCharacter) ?? [],
		backgrounds:
			pack.backgrounds?.map((x) => ({
				id: namespaceId(packId, x.id),
				label: x.label ?? x.id,
			})) ?? [],
		sprites:
			pack.sprites?.map((x) => ({
				id: namespaceId(packId, x.id),
				label: x.label ?? x.id,
			})) ?? [],
	};

	function normalizeCharacter(char: V2.JSONCharacter): INormalizedCharacter {
		return {
			id: namespaceId(packId, char.id),
			label: char.label ?? char.id,
			headGroups: Object.keys(char.heads ?? {}).map((x) => ({
				id: namespaceId(packId, x),
				label: x,
			})),
			styleGroups:
				char.styleGroups?.map((sg) => ({
					id: namespaceId(packId, sg.id),
					label: sg.id,
					parts: sg.styleComponents?.map((x) => x.id) ?? [],
					styles:
						sg.styles?.map((s) => ({
							id: getStyleId(s.components ?? {}),
							parts: s.components ?? {},
							poses:
								s.poses?.map((x) => ({
									id: namespaceId(packId, x.id),
									label: x.id,
									positions: Object.keys(x.positions ?? {}),
								})) ?? [],
						})) ?? [],
				})) ?? [],
		};
	}
}

function namespaceId(packId: string, id: string): string {
	if (id.includes(":")) return id;
	return `${packId}:${id}`;
}

export interface INormalizedPack {
	backgrounds: INormalizedObject[];
	sprites: INormalizedObject[];
	characters: INormalizedCharacter[];
}

export interface INormalizedObject {
	id: string;
	label: string;
}

export interface INormalizedCharacter extends INormalizedObject {
	headGroups: INormalizedObject[];
	styleGroups: INormalizedStyleGroup[];
}

export interface INormalizedStyleGroup extends INormalizedObject {
	parts: string[];
	styles: INormalizedStyle[];
}

export interface INormalizedStyle {
	id: string;
	parts: Record<string, string>;
	poses: INormalizedPose[];
}

export interface INormalizedPose extends INormalizedObject {
	positions: string[];
}
