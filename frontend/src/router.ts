import {
	hasChanges,
	isV2,
	useActivePack,
	useCharacter,
	useCharacterV1,
	useStyle,
	useStyleGroup,
} from "@/store/active-pack";
import { Confirm } from "@wails/go/main/App";
import type { MenuItem } from "primevue/menuitem";
import { computed, reactive, type ComputedRef } from "vue";
import {
	createRouter,
	createWebHashHistory,
	type RouteParamsRawGeneric,
} from "vue-router";
import { seekFreeIds } from "./array-tools";
import { useActiveRepo, usePackId } from "./store/active-pack";
import { useNormalizedDependecyTree } from "./store/dependencies";

// An objects id may change while a page is open.
// To prevent the currently open page from changing, we allow temporarily
// overriding the ids of the path params.
// They will be applied on the next page navigation.
const temporaryAlias = reactive(
	new Map<string, { oldValue: string; newValue: string }>(),
);

export function setTemporaryAlias(
	param: string,
	oldValue: string,
	newValue: string,
) {
	if (temporaryAlias.has(param)) {
		const existing = temporaryAlias.get(param);
		if (existing && existing.newValue === oldValue) {
			temporaryAlias.set(param, {
				oldValue: existing.oldValue,
				newValue: newValue,
			});
			return;
		}
	}
	temporaryAlias.set(param, { oldValue, newValue });
}

let useParamsComputed: ComputedRef<Record<string, string>> | undefined;

export function useParams(): ComputedRef<Record<string, string>> {
	if (!useParamsComputed) {
		useParamsComputed = computed(() => {
			const route = router.currentRoute.value;
			if (!route) return {};
			const ret = route.params as Record<string, string>;
			if (!ret) return {};
			if (temporaryAlias.size === 0) return ret;
			const withTranslations = { ...ret };
			for (const [param, value] of temporaryAlias.entries()) {
				withTranslations[param] = value.newValue;
			}
			return withTranslations;
		});
	}
	return useParamsComputed;
}

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: "/",
			meta: { title: "Home" },
			component: () => import("@/pages/select-pack-page.vue"),
		},
		{
			path: "/select-dddg",
			name: "select-dddg",
			meta: { title: "Select DDDG location" },
			component: () => import("@/pages/select-dddg-page.vue"),
		},
		{
			path: "/packs",
			children: [
				{
					path: "",
					name: "select-pack",
					meta: { title: "Packs" },
					component: () => import("@/pages/select-pack-page.vue"),
				},
				{
					path: "/new-pack/:basedOn?",
					name: "new-pack",
					meta: { title: "New pack" },
					component: () => import("@/pages/new-pack-page.vue"),
				},
				{
					path: ":packId",
					component: () => import("@/pages/edit-pack-page.vue"),
					children: [
						{
							path: "",
							name: "pack",
							meta: {
								title: () =>
									useActiveRepo().value?.pack.name ??
									`Pack ${usePackId().value ?? "unknown"}`,
							},
							component: () => import("@/pages/pack-overview-page.vue"),
						},
						{
							path: "character/:charId",
							meta: {
								header: "Characters",
								add: "Add character",
								children: (addChild: (id: string) => void): MenuItem[] => {
									const pack = useActivePack().value;
									const ret: MenuItem[] = [];
									if (!pack) return [];
									if (isV2(pack)) {
										for (const char of pack.characters ?? []) {
											ret.push({
												label: char.label ?? char.id,
												command: () => {
													go("character", {
														packId: pack.packId!,
														charId: char.id,
													});
												},
											});
										}
										for (const char of useNormalizedDependecyTree().value
											?.characters ?? []) {
											if (pack.characters?.find((x) => x.id === char.id))
												continue;
											ret.push({
												label: `Extend ${char.label ?? char.id}`,
												command: () => {
													addChild(char.id);
												},
											});
										}
									} else {
										if (pack.id) {
											ret.push({
												label: pack.name ?? pack.id,
												command: () => {
													go("character", {
														packId: pack.packId!,
														charId: pack.id,
													});
												},
											});
										} else {
											for (const char of useNormalizedDependecyTree().value
												?.characters ?? []) {
												ret.push({
													label: `Extend ${char.label ?? char.id}`,
													command: () => {
														addChild(char.id);
													},
												});
											}
										}
									}
									return ret;
								},
								doAddChild: (id?: string) => {
									const pack = useActivePack().value;
									if (!pack) return;
									if (isV2(pack)) {
										id ??= seekFreeIds(
											"character",
											pack.characters?.map((x) => x.id) ?? [],
										);
										if (!pack.characters) {
											pack.characters = [];
										}
										pack.characters.push({
											id,
										});
									} else {
										if (pack.id) return;
										id ??= pack.id.split(".")[0];
										pack.id = id;
									}
									go("character", {
										packId: pack.packId!,
										charId: id,
									});
								},
								canAddChildren: () => {
									// V1 packs can only have one character
									const pack = useActivePack().value;
									if (pack && !isV2(pack) && pack.id) {
										return false;
									}
									return true;
								},
							},
							children: [
								{
									path: "",
									name: "character",
									component: () => import("@/pages/character-page.vue"),
									meta: {
										title: () => {
											const char =
												useCharacter().value || useCharacterV1().value;
											if (!char) return "Character";
											if ("label" in char && char.label) return char.label;
											if ("name" in char && char.name) return char.name;
											return char.id;
										},
									},
								},
								{
									path: "heads/:headGroupId",
									name: "heads",
									component: () => import("@/pages/heads-page.vue"),
									meta: {
										header: "Heads",
										add: "Add head group",
										children: (addChild: (id: string) => void): MenuItem[] => {
											const charId = useParams().value.charId as
												| string
												| undefined;
											const pack = useActivePack().value;
											if (!pack || charId == null) return [];
											const ret: MenuItem[] = [];
											if (isV2(pack)) {
												const char = pack.characters?.find(
													(x) => x.id === charId,
												);
												if (!char) return [];
												for (const head of Object.keys(char.heads ?? [])) {
													ret.push({
														label: head,
														command: () => {
															go("heads", {
																packId: pack.packId!,
																charId,
																headGroupId: head,
															});
														},
													});
												}
											} else {
												for (const head of Object.keys(pack.heads ?? [])) {
													ret.push({
														label: head,
														command: () => {
															go("heads", {
																packId: pack.packId!,
																charId,
																headGroupId: head,
															});
														},
													});
												}
											}

											for (const head of useNormalizedDependecyTree().value?.characters.find(
												(x) => x.id === charId,
											)?.headGroups ?? []) {
												ret.push({
													label: `Extend ${head.label ?? head.id}`,
													command: () => {
														addChild(head.id);
													},
												});
											}

											return ret;
										},
										doAddChild: (id?: string) => {
											const char = useCharacter().value;
											const charV1 = useCharacterV1().value;
											const pack = useActivePack().value;
											if (!pack) return;
											if (!char && !charV1) return;
											id ??= seekFreeIds(
												"head",
												Object.keys((char || charV1)!.heads ?? {}),
											);
											if (char) {
												if (!char.heads) {
													char.heads = {};
												}
												char.heads[id] = { variants: [] };
											} else if (charV1) {
												if (!charV1.heads) {
													charV1.heads = {};
												}
												charV1.heads[id] = { all: [] };
											}
											go("heads", {
												packId: pack.packId!,
												charId: id,
												headGroupId: id,
											});
										},
									},
								},
								{
									path: "styleGroup/:styleGroupId",
									meta: {
										header: "Style groups",
										add: "Add style group",
										children: (addChild: (id: string) => void): MenuItem[] => {
											const charId = useParams().value.charId as
												| string
												| undefined;
											const char = useCharacter().value;
											if (!char || charId == null) return [];
											const ret: MenuItem[] = [];
											for (const styleGroup of char.styleGroups ?? []) {
												ret.push({
													label: styleGroup.id,
													command: () => {
														go("style-group", {
															packId: usePackId().value!,
															charId,
															styleGroupId: styleGroup.id,
														});
													},
												});
											}

											for (const sg of useNormalizedDependecyTree().value?.characters.find(
												(x) => x.id === charId,
											)?.styleGroups ?? []) {
												ret.push({
													label: `Extend ${sg.label ?? sg.id}`,
													command: () => {
														addChild(sg.id);
													},
												});
											}

											return ret;
										},
										doAddChild: (id?: string) => {
											const char = useCharacter().value;
											const pack = useActivePack().value;
											if (!pack || !char) return;
											id ??= seekFreeIds(
												"style-group",
												char.styleGroups?.map((x) => x.id) ?? [],
											);
											if (!char.styleGroups) {
												char.styleGroups = [];
											}
											char.styleGroups.push({
												id,
												styles: [
													{
														poses: [],
													},
												],
											});
											go("style-group", {
												packId: pack.packId!,
												charId: char?.id ?? "",
												styleGroupId: id,
											});
										},
										canAddChildren: () => {
											const packV = useActivePack().value;
											return !!(packV && isV2(packV));
										},
									},
									children: [
										{
											path: "",
											name: "style-group",
											meta: {
												version: 2,
												title: () => {
													const sg = useStyleGroup().value;
													if (!sg) return "Style";
													return `Style '${sg.id}'`;
												},
											},
											component: () => import("@/pages/style-group-page.vue"),
										},
										{
											path: "style/:styleId",
											meta: {
												header: "Style",
												add: "Add style",
												children: (
													addChild: (id: string) => void,
												): MenuItem[] => {
													const sg = useStyleGroup().value;
													const char = useCharacter().value;
													if (!sg || !char) return [];
													const ret: MenuItem[] = [];
													for (let i = 0; i < sg.styles.length; i++) {
														const style = sg.styles[i];
														ret.push({
															label:
																style.components &&
																Object.keys(style.components).length > 0
																	? JSON.stringify(style.components)
																	: "default",
															command: () => {
																go("style", {
																	packId: usePackId().value!,
																	charId: char.id,
																	styleGroupId: sg.id,
																	styleId: "" + i,
																});
															},
														});
													}

													return ret;
												},
												doAddChild: (id?: string) => {
													const char = useCharacter().value;
													const pack = useActivePack().value;
													if (!pack || !char) return;
													id ??= seekFreeIds(
														"style-group",
														char.styleGroups?.map((x) => x.id) ?? [],
													);
													if (!char.styleGroups) {
														char.styleGroups = [];
													}
													char.styleGroups.push({
														id,
														styles: [],
													});
													go("style-group", {
														packId: pack.packId!,
														charId: char?.id ?? "",
														styleGroupId: id,
													});
												},
												canAddChildren: () => false,
											},
											children: [
												{
													path: "",
													name: "style",
													component: () => import("@/pages/style-page.vue"),
													meta: {
														title: () => "Style",
													},
												},
												{
													path: "pose/:poseId",
													name: "pose",
													component: () => import("@/pages/pose-page.vue"),
													meta: {
														header: "Poses",
														add: "Add pose",
														children: (
															addChild: (id: string) => void,
														): MenuItem[] => {
															const charV = useCharacter().value;
															const styleV = useStyle().value;
															const sg = useStyleGroup().value;
															if (!styleV || !charV || !sg) return [];
															const ret: MenuItem[] = [];
															for (const pose of styleV.poses) {
																ret.push({
																	label: pose.id,
																	command: () => {
																		go("pose", {
																			packId: usePackId().value!,
																			charId: charV.id,
																			styleGroupId: sg.id,
																			styleId: useParams().value.styleId,
																			poseId: pose.id,
																		});
																	},
																});
															}

															for (const pose of useNormalizedDependecyTree()
																.value?.characters.find(
																	(x) => x.id === charV.id,
																)
																?.styleGroups.find((x) => x.id === sg.id)
																?.styles[
																parseInt(useParams().value.styleId, 10)
															]?.poses ?? []) {
																if (styleV.poses?.find((x) => x.id === pose.id))
																	continue;
																ret.push({
																	label: `Extend ${pose.label ?? pose.id}`,
																	command: () => {
																		addChild(pose.id);
																	},
																});
															}

															return ret;
														},
														doAddChild: (id?: string) => {
															const packId = usePackId().value;
															const charV = useCharacter().value;
															const sg = useStyleGroup().value;
															const styleV = useStyle().value;
															if (!styleV || !charV || !sg || packId == null)
																return;
															id ??= seekFreeIds(
																"pose",
																styleV.poses?.map((x) => x.id) ?? [],
															);
															styleV.poses ??= [];
															styleV.poses.push({
																id,
															});
															go("pose", {
																packId,
																charId: charV.id,
																styleGroupId: sg.id,
																styleId: useParams().value.styleId,
																poseId: id,
															});
														},
													},
												},
											],
										},
									],
								},
								{
									path: "style/:styleId",
									name: "v1-style",
									component: () => import("@/pages/v1-style-page.vue"),
									meta: {
										version: 1,
										header: "Styles",
										add: "Add style",
										children: (addChild: (id: string) => void): MenuItem[] => {
											const charId = useParams().value.charId as
												| string
												| undefined;
											const pack = useActivePack().value;
											if (!pack || charId == null) return [];
											const ret: MenuItem[] = [];
											if (isV2(pack)) return ret;
											for (const style of pack.styles ?? []) {
												ret.push({
													label: style.label,
													command: () => {
														go("v1-style", {
															packId: pack.packId!,
															charId,
															styleId: style.name,
														});
													},
												});
											}

											return ret;
										},
										doAddChild: (id?: string) => {
											const char = useCharacter().value;
											const charV1 = useCharacterV1().value;
											const pack = useActivePack().value;
											if (!pack) return;
											if (!char && !charV1) return;
											id ??= seekFreeIds(
												"head",
												Object.keys((char || charV1)!.heads ?? {}),
											);
											if (char) {
												if (!char.heads) {
													char.heads = {};
												}
												char.heads[id] = { variants: [] };
											} else if (charV1) {
												if (!charV1.heads) {
													charV1.heads = {};
												}
												charV1.heads[id] = { all: [] };
											}
											go("heads", {
												packId: pack.packId!,
												charId: id,
												headGroupId: id,
											});
										},
										canAddChild: () => {
											const packV = useActivePack().value;
											return packV && !isV2(packV);
										},
									},
								},
								{
									path: "poses/:poseId",
									name: "v1-pose",
									component: () => import("@/pages/v1-pose-page.vue"),
									meta: {
										version: 1,
										header: "Poses",
										add: "Add pose",
										children: (addChild: (id: string) => void): MenuItem[] => {
											const charId = useParams().value.charId as
												| string
												| undefined;
											const pack = useActivePack().value;
											if (!pack || charId == null) return [];
											const ret: MenuItem[] = [];
											if (isV2(pack)) return ret;
											for (const pose of pack.poses ?? []) {
												ret.push({
													label: pose.name,
													command: () => {
														go("v1-pose", {
															packId: pack.packId!,
															charId,
															poseId: pose.name,
														});
													},
												});
											}

											return ret;
										},
										doAddChild: (id?: string) => {
											const char = useCharacter().value;
											const charV1 = useCharacterV1().value;
											const pack = useActivePack().value;
											if (!pack) return;
											if (!char && !charV1) return;
											id ??= seekFreeIds(
												"head",
												Object.keys((char || charV1)!.heads ?? {}),
											);
											if (char) {
												if (!char.heads) {
													char.heads = {};
												}
												char.heads[id] = { variants: [] };
											} else if (charV1) {
												if (!charV1.heads) {
													charV1.heads = {};
												}
												charV1.heads[id] = { all: [] };
											}
											go("heads", {
												packId: pack.packId!,
												charId: id,
												headGroupId: id,
											});
										},
										canAddChild: () => {
											const packV = useActivePack().value;
											return packV && !isV2(packV);
										},
									},
								},
							],
						},
						{
							path: "sprite/:spriteId",
							name: "sprite",
							component: () => import("@/pages/sprite-page.vue"),
							meta: {
								header: "Sprites",
								add: "Add sprite",
								children: (addChild: (id: string) => void): MenuItem[] => {
									const packV = useActivePack().value;
									if (!packV || !isV2(packV) || !packV.sprites) return [];
									const ret: MenuItem[] = [];
									for (const sprite of packV.sprites) {
										ret.push({
											label: sprite.id,
											command: () => {
												go("sprite", {
													packId: packV.packId,
													spriteId: sprite.id,
												});
											},
										});
									}

									for (const sprite of useNormalizedDependecyTree().value
										?.sprites ?? []) {
										if (packV.sprites.find((x) => x.id === sprite.id)) continue;
										ret.push({
											label: `Extend ${sprite.label ?? sprite.id}`,
											command: () => {
												addChild(sprite.id);
											},
										});
									}

									return ret;
								},
								doAddChild: (id?: string) => {
									const packV = useActivePack().value;
									if (!packV || !isV2(packV)) return;
									packV.sprites ??= [];
									id ??= seekFreeIds(
										"sprite",
										packV.sprites?.map((x) => x.id) ?? [],
									);
									packV.sprites.push({
										id,
										variants: [],
									});
									go("sprite", {
										packId: packV.packId,
										spriteId: id,
									});
								},
								canAddChildren: () => {
									const packV = useActivePack().value;
									return !!(packV && isV2(packV));
								},
							},
						},
						{
							path: "background/:backgroundId",
							name: "background",
							component: () => import("@/pages/background-page.vue"),
							meta: {
								header: "Backgrounds",
								add: "Add background",
								children: (addChild: (id: string) => void): MenuItem[] => {
									const packV = useActivePack().value;
									if (!packV || !isV2(packV) || !packV.backgrounds) return [];
									const ret: MenuItem[] = [];
									for (const background of packV.backgrounds) {
										ret.push({
											label: background.id,
											command: () => {
												go("background", {
													packId: packV.packId,
													backgroundId: background.id,
												});
											},
										});
									}

									for (const background of useNormalizedDependecyTree().value
										?.backgrounds ?? []) {
										if (packV.backgrounds.find((x) => x.id === background.id))
											continue;
										ret.push({
											label: `Extend ${background.label ?? background.id}`,
											command: () => {
												addChild(background.id);
											},
										});
									}

									return ret;
								},
								doAddChild: (id?: string) => {
									const packV = useActivePack().value;
									if (!packV || !isV2(packV)) return;
									packV.backgrounds ??= [];
									id ??= seekFreeIds(
										"background",
										packV.backgrounds?.map((x) => x.id) ?? [],
									);
									packV.backgrounds.push({
										id,
										variants: [],
									});
									go("background", {
										packId: packV.packId,
										backgroundId: id,
									});
								},
								canAddChildren: () => {
									const packV = useActivePack().value;
									return !!(packV && isV2(packV));
								},
							},
						},
						{
							path: "authors/:authorId",
							name: "author",
							component: () => import("@/pages/author-page.vue"),
							meta: {
								header: "Authors",
								add: "Add author",
								children: (): MenuItem[] => {
									const packV = useActivePack().value;
									if (!packV?.authors) return [];
									const ret: MenuItem[] = [];
									for (const author of packV.authors) {
										ret.push({
											label: author,
											command: () => {
												go("author", {
													packId: packV.packId!,
													authorId: author,
												});
											},
										});
									}

									return ret;
								},
								doAddChild: () => {
									const packV = useActivePack().value;
									if (!packV) return;
									go("new-author", {
										packId: packV.packId!,
									});
								},
							},
						},
						{
							path: "new-author",
							name: "new-author",
							component: () => import("@/pages/new-author-page.vue"),
						},
					],
				},
			],
		},
	],
});

// Type information for all named routes
// TODO: Maybe we can use this to type check the createRouter above? So we can
//       force them to stay in sync? Also add typing for the meta information
interface Paths {
	"select-dddg": void;
	"select-pack": void;
	"new-pack": { basedOn?: string } | void;
	pack: { packId: string };
	character: { packId: string; charId: string };
	"style-group": { packId: string; charId: string; styleGroupId: string };
	style: {
		packId: string;
		charId: string;
		styleGroupId: string;
		styleId: string;
	};
	pose: {
		packId: string;
		charId: string;
		styleGroupId: string;
		styleId: string;
		poseId: string;
	};
	"v1-style": { packId: string; charId: string; styleId: string };
	"v1-pose": {
		packId: string;
		charId: string;
		poseId: string;
	};
	heads: { packId: string; charId: string; headGroupId: string };
	background: { packId: string; backgroundId: string };
	sprite: { packId: string; spriteId: string };
	author: { packId: string; authorId: string };
	"new-author": { packId: string };
}

export function goUp(): void {
	router.push("..");
}

export function go<T extends keyof Paths>(
	pathName: T,
	...params: Paths[T] extends void ? [] : [Paths[T]]
): void {
	router.push({
		name: pathName,
		params:
			params.length === 0
				? undefined
				: (params[0] as RouteParamsRawGeneric | undefined),
	});
}

export function href<T extends keyof Paths>(
	pathName: T,
	...params: Paths[T] extends void ? [] : [Paths[T]]
): string {
	return router.resolve({
		name: pathName,
		params:
			params.length === 0
				? undefined
				: (params[0] as RouteParamsRawGeneric | undefined),
	}).href;
}

router.beforeEach(async (to, from) => {
	// If we are moving out of a pack, or to a different pack, and there are
	// unsaved changes, warn the user first!
	const isLeavingPack =
		!!from.params.packId && to.params.packId !== from.params.packId;
	if (isLeavingPack && hasChanges.value) {
		const discard = await Confirm(
			"There are changes made to the pack that have not yet been saved. Do you want to discard these changes?",
			"Unsaved changes",
		);
		if (!discard) return false;
	}

	// Bake temporary alias params into the route params, then clear the
	// temporaries
	for (const key of temporaryAlias.keys()) {
		const { oldValue, newValue } = temporaryAlias.get(key)!;
		if (to.params && to.params[key] === oldValue) {
			to.params[key] = newValue;
		}
	}
	temporaryAlias.clear();
	return true;
});
