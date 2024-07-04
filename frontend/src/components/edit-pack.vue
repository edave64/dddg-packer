<script setup lang="ts">
import type { IPack, ISupportedRepo } from "@/repo";
import type { JSONCharacter as V1Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type { JSONContentPack as V2Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { ref, watch } from "vue";
import { Confirm } from "../../wailsjs/go/main/App";
import { coreState, saveFile } from "../core-state";
import type { HeadDummy } from "./pack-v1/headDummy";
import PackV1 from "./pack-v1/pack-v1.vue";
import PackV2 from "./pack-v2/pack-v2.vue";

const repo = ref(null as null | ISupportedRepo);
const pack = ref(null as null | V1Json<HeadDummy> | V2Json);

watch(
	coreState,
	async (core) => {
		if (!core?.mountedPackPath) {
			repo.value = null;
			return;
		}
		try {
			const repoJSON = await (
				await fetch(`/packs/${core.mountedPackPath}/repo.json`)
			).json();
			repo.value = repoJSON;
			repoChanges.value = false;
			repoUpdated = true;
		} catch (e) {
			console.error("Cannot load repo.json", e);
		}
	},
	{ immediate: true },
);

watch(
	() => repo.value,
	async (currentRepo) => {
		try {
			const repoJSON = currentRepo?.pack;
			if (!repoJSON) {
				pack.value = null;
				return;
			}
			const core = coreState.value;
			if (!core) return;

			const packJson = await (
				await fetch(
					`/packs/${core.mountedPackPath}/${getPackJsonPath(repoJSON)}`,
				)
			).json();

			// mountedPackPath changed
			if (repo.value !== currentRepo) return;
			pack.value = packJson;
			packUpdated = true;
			packChanges.value = false;
		} catch (e) {
			console.error("Cannot load index.json", e);
		}
	},
	{ immediate: true },
);

let repoUpdated = false;
let packUpdated = false;

const repoChanges = ref(false);
const packChanges = ref(false);

watch(
	() => repo.value,
	() => {
		repoChanges.value = !repoUpdated;
		repoUpdated = false;
	},
	{ deep: true },
);

watch(
	() => pack.value,
	() => {
		packChanges.value = !packUpdated;
		packUpdated = false;
	},
	{ deep: true },
);

function normalizeRepoPath(path: string): string {
	const core = coreState.value;
	if (!core) return path;
	if (path.startsWith("http://") || path.startsWith("https://")) {
		const packId = core.mountedPackPath;
		return path.substring(path.indexOf(packId) + packId.length + 1);
	}
	return path;
}

function getPackJsonPath(repoJSON: IPack) {
	if (repoJSON.dddg1Path && repoJSON.dddg2Path) {
		throw new Error("Cannot load dual pack");
	}

	const path = repoJSON.dddg2Path ?? repoJSON.dddg1Path;
	if (path == null) {
		throw new Error("No a DDDG pack");
	}
	return normalizeRepoPath(path);
}

async function save() {
	const repoV = repo.value;
	if (!repoV) return;

	if (repoChanges.value) {
		await saveRepo(repoV);
		repoChanges.value = false;
	}
	if (packChanges.value) {
		await savePack(repoV);
		packChanges.value = false;
	}
}

async function saveRepo(repoV: ISupportedRepo) {
	repoV.$schema =
		"https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json";
	await saveFile("repo.json", JSON.stringify(repoV, undefined, "\t"));
}

async function savePack(repoV: ISupportedRepo) {
	await saveFile(
		getPackJsonPath(repoV.pack),
		JSON.stringify(pack.value, undefined, "\t"),
	);
}

async function GoToPackList() {
	if (repoChanges.value || packChanges.value) {
		if (
			!(await Confirm(
				"There are changes made to the pack that have not yet been saved. Do you want to discard these changes?",
				"Unsaved changes",
			))
		)
			return;
	}
	if (coreState.value) {
		coreState.value.mountedPackPath = "";
	}
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item href="#" @click="GoToPackList()"
			>Packs</fast-breadcrumb-item
		>
	</teleport>
	<main>
		<fast-tree-view id="tree"> </fast-tree-view>
		<p v-if="!repo?.pack">ERROR: No pack in repo file</p>
		<p v-else-if="!repo.pack.dddg1Path && !repo.pack.dddg2Path">
			ERROR: No content pack json referenced in repo.json
		</p>
		<p v-else-if="repo.pack.dddg1Path && repo.pack.dddg2Path">
			ERROR: Multiple content pack jsons referenced in repo.json
		</p>
		<p v-else-if="!pack">No pack</p>
		<PackV2
			v-else-if="'version' in pack"
			:repo="repo"
			:json="pack"
			:id="coreState!.mountedPackPath"
		/>
		<PackV1 v-else :repo="repo" :json="pack" :id="coreState!.mountedPackPath" />
	</main>
	<footer>
		<a v-if="repoChanges || packChanges" href="#" @click="save()"
			>Save changes</a
		>
	</footer>
</template>

<style>
#tree {
	width: 256px;
}

main {
	display: flex;
	width: 100%;
	flex-grow: 1;
	overflow: hidden;

	> * {
		height: 100%;
		overflow-y: auto;
		overflow-x: none;
	}
}

main {
	flex-grow: 1;
}

footer {
	height: 32px;
	flex-shrink: 0;
}
</style>
