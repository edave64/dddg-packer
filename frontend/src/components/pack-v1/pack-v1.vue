<script setup lang="ts">
import type { ISupportedRepo } from "@/repo";
import type { JSONCharacter as V1Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import Button from "primevue/button";
import { computed, ref, type PropType } from "vue";
import { MountPack, OpenFolder } from "../../../wailsjs/go/main/App";
import { joinNormalize } from "../../path-tools";
import ImageCollection from "../pack-v2/image-collection.vue";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import Character from "./character.vue";
import type { HeadDummy } from "./headDummy";

const props = defineProps({
	json: {
		required: true,
		type: Object as PropType<V1Extended>,
	},
	repo: {
		required: true,
		type: Object as PropType<ISupportedRepo>,
	},
	id: {
		required: true,
		type: String,
	},
});

const root = joinNormalize("", "./");
const folder = computed(() => {
	return joinNormalize(root, props.json.folder);
});

const state = ref(null as State);

type State = null | {
	t: "char";
	obj: V1Json<HeadDummy>;
};

window.j = props.json;

interface V1Extended extends V1Json<HeadDummy> {
	dependencies: string[];
}

if (!props.json.dependencies) {
	const deps = new Set<string>();
	// TODO: Detect V1 native dependencies
	if (props.json.id.includes(":")) {
		deps.add(props.json.id.split(":")[0]);

		for (const pose of props.json.poses ?? []) {
			if (!pose.name.includes(":")) continue;
			deps.add(pose.name.split(":")[0]);
		}

		for (const head of Object.keys(props.json.heads ?? {})) {
			if (!head.includes(":")) continue;
			deps.add(head.split(":")[0]);
		}
	}

	// TODO: Typing of dependencies is messed up
	props.json.dependencies = Array.from(deps);
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item :href="state ? '#' : ''" @click="state = null">{{
			id
		}}</fast-breadcrumb-item>
	</teleport>
	<div class="pack_wrapper">
		<template v-if="state === null">
			<teleport to="#tree">
				<fast-tree-item @click="MountPack('')">Back to packs</fast-tree-item>
				<fast-tree-item expanded>
					Character
					<fast-tree-item @click="state = { t: 'char', obj: json }">
						{{ json.name ? `${json.name} [${json.id}]` : json.id }}
					</fast-tree-item>
				</fast-tree-item>
			</teleport>
			<h2>Pack</h2>
			<Button @click="OpenFolder()">Open folder in explorer</Button>
			<PInput label="ID" v-model="repo.pack.id" />
			<PInput label="Name" v-model="repo.pack.name" />
			<PInput label="Source" v-model="repo.pack.source" />
			<PInput label="Description" v-model="repo.pack.description" />
			<ImageCollection
				title="Preview"
				:imageCollection="repo.pack.preview"
				folder="./"
			/>
			<Code :obj="repo" />
		</template>
		<Character
			:char="state.obj"
			:folder="folder"
			@leave="state = null"
			v-else-if="state.t === 'char'"
		/>
	</div>
</template>
<style>
.pack_wrapper {
	width: 100%;
	height: 100%;
	overflow: auto;
}
</style>
