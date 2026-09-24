<script setup lang="ts">
import ImageCollection from "@/components/pack-v2/image-collection.vue";
import Code from "@/components/shared/code.vue";
import PInput from "@/components/shared/p-input.vue";
import { joinNormalize } from "@/path-tools";
import {
	useActivePack,
	useActiveRepo,
	usePackId,
	type V1Extended,
} from "@/store/active-pack.js";
import { OpenFolder } from "@wails/go/main/App";
import { Listbox } from "primevue";
import Button from "primevue/button";
import { computed, watch, type ComputedRef } from "vue";

const packId = usePackId();

// Parent should ensure that we are in a v2 pack
const pack = useActivePack() as ComputedRef<V1Extended | undefined>;
const repo = useActiveRepo();

const root = joinNormalize("", "./");

// Backfill dependencies for packs created outside of the packer
watch(pack, (pack) => {
	if (!pack) return;
	if ("dependencies" in pack) return;

	const deps = new Set<string>();
	if (pack.id.includes(":")) {
		deps.add(pack.id.split(":")[0]);

		for (const pose of pack.poses ?? []) {
			if (!pose.name.includes(":")) continue;
			deps.add(pose.name.split(":")[0]);
		}

		for (const head of Object.keys(pack.heads ?? {})) {
			if (!head.includes(":")) continue;
			deps.add(head.split(":")[0]);
		}
	}

	pack.dependencies = Array.from(deps);
});

const hasImplicitDependencies = computed(() => {
	const packV = pack.value;
	if (!packV) return;

	return (
		packV.id === "ddlc.monika" ||
		packV.id === "ddlc.sayori" ||
		packV.id === "ddlc.natsuki" ||
		packV.id === "ddlc.yuri" ||
		packV.id === "ddlc.fan.mc1" ||
		packV.id === "ddlc.fan.mc2" ||
		packV.id === "ddlc.fan.mc_chad" ||
		packV.id === "ddlc.fan.femc" ||
		packV.id === "ddlc.fan.amy1" ||
		packV.id === "ddlc.fan.amy2"
	);
});

function addDependency() {}
</script>
<template>
	<template v-if="pack && repo">
		<h2>Pack</h2>
		<p v-if="hasImplicitDependencies">
			WARNING: This pack is an old style character extension. These are
			not yet supported by this tool. Saving this pack might break it.
		</p>
		<Button @click="OpenFolder(packId ?? '')"
			>Open folder in explorer</Button
		>
		<PInput id="pack-id" label="ID" v-model="repo.pack.id" />
		<PInput id="pack-name" label="Name" v-model="repo.pack.name" />
		<PInput id="pack-source" label="Source" v-model="repo.pack.source" />
		<PInput
			id="pack-description"
			label="Description"
			v-model="repo.pack.description"
		/>
		<fieldset v-if="pack.dependencies">
			<legend>Dependencies</legend>
			<Listbox :options="pack.dependencies" />
			<Button @click="addDependency()">Add dependency</Button>
		</fieldset>
		<ImageCollection
			id="pack-preview"
			title="Preview"
			:imageCollection="repo.pack.preview"
			folder="./"
		/>
		<Code :obj="repo.pack" />
	</template>
</template>
