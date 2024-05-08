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
const props = defineProps({
	coreState: {
		required: true,
		type: Object as PropType<CoreState>,
	},
});

interface IRepo {
	$schema: "https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json";
	pack?: IPack;
	packs?: IPack[];
	authors: {
		[key: string]: IAuthor;
	};
}

interface IPack {
	id: string;
	name: string;
	dddg1Path?: string;
	dddg2Path?: string;
	characters: string[];
	authors: string[];
}

interface IAuthor {
	reddit?: string;
}

type HeadDummy = Record<string, JSONHeadCollection>;
const repo = ref(null as null | IRepo);
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
	{ immediate: true },
);

watch(
	() => repo.value,
	async (currentRepo) => {
		try {
			const repoJSON = currentRepo?.pack;
			if (!repoJSON) {
				throw new Error();
			}

			if (repoJSON.dddg1Path && repoJSON.dddg2Path) {
				console.error("Cannot load dual pack");
				throw new Error();
			}

			const path = repoJSON.dddg2Path ?? repoJSON.dddg1Path;
			if (path == null) {
				console.error("No a DDDG pack");
				throw new Error();
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
	{ immediate: true },
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
	<p>
		Opened pack: {{ coreState.mountedPackPath }}
		<a href="#" @click="MountPack('')">[Close]</a>
	</p>
	<p v-if="!repo?.pack">ERROR: No pack in repo file</p>
	<p v-else-if="!repo.pack.dddg1Path && !repo.pack.dddg2Path">
		ERROR: No content pack json referenced in repo.json
	</p>
	<p v-else-if="repo.pack.dddg1Path && repo.pack.dddg2Path">
		ERROR: Multiple content pack jsons referenced in repo.json
	</p>
	<p v-else-if="'version' in pack!">
		<PackV2 :json="pack" />
	</p>
	<p v-else>
		{{ JSON.stringify(pack) }}
	</p>
</template>
