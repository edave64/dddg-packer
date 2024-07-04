<script setup lang="ts">
import { coreState } from "@/core-state";
import type { ISupportedRepo } from "@/repo";
import type { JSONCharacter as V1Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import Button from "primevue/button";
import { computed, ref, type PropType } from "vue";
import { OpenFolder } from "../../../wailsjs/go/main/App";
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

// V1 has a couple of character ids that implicitly extend existing characters
// Don't know if I should even support this. New packs should just use V2.
/*const implicitDependencies = computed(() => {
	const deps = new Set<string>(props.json.dependencies ?? []);
	switch (props.json.id) {
		case "ddlc.monika":
			deps.add("dddg.buildin.base.monika");
			break;
	}
});*/

const hasImplicitDependencies = computed(() => {
	return (
		props.json.id === "ddlc.monika" ||
		props.json.id === "ddlc.sayori" ||
		props.json.id === "ddlc.natsuki" ||
		props.json.id === "ddlc.yuri" ||
		props.json.id === "ddlc.fan.mc1" ||
		props.json.id === "ddlc.fan.mc2" ||
		props.json.id === "ddlc.fan.mc_chad" ||
		props.json.id === "ddlc.fan.femc" ||
		props.json.id === "ddlc.fan.amy1" ||
		props.json.id === "ddlc.fan.amy2"
	);
});

function toPacks() {
	if (!coreState.value) return;
	coreState.value.mountedPackPath = "";
}

function addDependency() {}
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
				<fast-tree-item @click="toPacks()">Back to packs</fast-tree-item>
				<fast-tree-item expanded>
					Character
					<fast-tree-item @click="state = { t: 'char', obj: json }">
						{{ json.name ? `${json.name} [${json.id}]` : json.id }}
					</fast-tree-item>
				</fast-tree-item>
			</teleport>
			<h2>Pack</h2>
			<p v-if="hasImplicitDependencies">
				WARNING: This pack is an old style character extension. These are not
				yet supported by this tool. Saving this pack might break it.
			</p>
			<Button @click="OpenFolder(coreState?.mountedPackPath ?? '')"
				>Open folder in explorer</Button
			>
			<PInput label="ID" v-model="repo.pack.id" />
			<PInput label="Name" v-model="repo.pack.name" />
			<PInput label="Source" v-model="repo.pack.source" />
			<PInput label="Description" v-model="repo.pack.description" />
			<fieldset v-if="json.dependencies">
				<legend>Dependencies</legend>
				<Listbox :options="json.dependencies" />
				<Button @click="addDependency()">Add dependency</Button>
			</fieldset>
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
