<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import type { CoreState } from "../core-state";
import type {
	JSONCharacter as V1Json,
	JSONHeadCollection,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type { JSONContentPack as V2Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import PackV2 from "./pack-v2.vue";
import { MountPack } from "../../wailsjs/go/main/App";
import type { IRepo, ISupportedRepo } from "@/repo";
const props = defineProps({
	coreState: {
		required: true,
		type: Object as PropType<CoreState>,
	},
});

type HeadDummy = Record<string, JSONHeadCollection>;
const repo = ref(null as null | ISupportedRepo);
const pack = ref(null as null | V1Json<HeadDummy> | V2Json);

watch(
	() => props.coreState.mountedPackPath,
	async (packId) => {
		if (packId === "") {
			repo.value = null;
			return;
		}
		try {
			const repoJSON = await (await fetch("/mountedPack/repo.json")).json();
			// mountedPackPath changed
			if (props.coreState.mountedPackPath !== packId) return;
			repo.value = repoJSON;
		} catch (e) {
			console.error("Cannot load repo.json", e);
		}
	},
	{ immediate: true }
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

			if (repoJSON.dddg1Path && repoJSON.dddg2Path) {
				throw new Error("Cannot load dual pack");
			}

			const path = repoJSON.dddg2Path ?? repoJSON.dddg1Path;
			if (path == null) {
				throw new Error("No a DDDG pack");
			}

			const packJson = await (
				await fetch(`/mountedPack/${normalizeRepoPath(path)}`)
			).json();

			// mountedPackPath changed
			if (repo.value !== currentRepo) return;
			pack.value = packJson;
		} catch (e) {
			console.error("Cannot load index.json", e);
		}
	},
	{ immediate: true }
);

function normalizeRepoPath(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		const packId = props.coreState.mountedPackPath;
		return path.substring(path.indexOf(packId) + packId.length + 1);
	}
	return path;
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item href="#" @click="MountPack('')"
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
			:id="coreState.mountedPackPath"
		/>
		<p v-else>
			{{ JSON.stringify(pack) }}
		</p>
	</main>
	<footer>{{ coreState?.mountedPackPath }}</footer>
</template>

<style>
#tree {
	width: 256px;
}

main {
	display: flex;
	width: 100%;
	height: calc(100% - 64px);
	flex-grow: 1;

	> * {
		height: 100%;
		overflow-y: auto;
		overflow-x: none;
	}
}

header {
	height: 32px;
	padding-inline-start: 8px;
	flex-shrink: 0;
}

main {
	flex-grow: 1;
}

footer {
	height: 32px;
	padding-inline-start: 8px;
	flex-shrink: 0;
}
</style>
