<script setup lang="ts">
import Dependencies from "@/components/pack-v2/dependencies.vue";
import ImageCollection from "@/components/pack-v2/image-collection.vue";
import Code from "@/components/shared/code.vue";
import PInput from "@/components/shared/p-input.vue";
import { useActivePack, useActiveRepo } from "@/store/active-pack";
import type { JSONContentPack as V2Json } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { OpenFolder } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, watch, type ComputedRef } from "vue";

// Parent should ensure that we are in a v2 pack
const activePack = useActivePack() as ComputedRef<V2Json | undefined>;
const activeRepo = useActiveRepo();

// Backfill dependencies for packs created outside of the packer
watch(activePack, (pack) => {
	if (!pack) return;
	if ("dependencies" in pack) return;

	const deps = new Set<string>();
	for (const char of pack.characters ?? []) {
		if (!char.id.includes(":")) continue;
		deps.add(char.id.split(":")[0]);

		for (const styleGroup of char.styleGroups ?? []) {
			if (!styleGroup.id.includes(":")) continue;
			deps.add(styleGroup.id.split(":")[0]);

			for (const style of styleGroup.styles ?? []) {
				for (const pose of style.poses ?? []) {
					if (pose.id.includes(":")) {
						deps.add(pose.id.split(":")[0]);
					}

					for (const head of pose.compatibleHeads ?? []) {
						if (!head.includes(":")) continue;
						deps.add(head.split(":")[0]);
					}
				}
			}
		}

		for (const head of Object.keys(char.heads ?? {})) {
			if (!head.includes(":")) continue;
			deps.add(head.split(":")[0]);
		}
	}

	for (const sprite of pack.sprites ?? []) {
		if (!sprite.id.includes(":")) continue;
		deps.add(sprite.id.split(":")[0]);
	}

	for (const background of pack.backgrounds ?? []) {
		if (!background.id.includes(":")) continue;
		deps.add(background.id.split(":")[0]);
	}

	pack.dependencies = Array.from(deps) as [];
});

const dependencies = computed({
	get() {
		const pack = activePack.value;
		if (!pack) return [];
		return (pack.dependencies as string[]) ?? [];
	},
	set(value: Array<string>) {
		const pack = activePack.value;
		if (!pack) return;
		pack.dependencies = value as [];
	},
});
</script>
<template>
	<div class="pack_wrapper" v-if="activePack && activeRepo">
		<div class="header">
			<h2>Pack</h2>
			<Button @click="OpenFolder(activeRepo.pack.id)"
				>Open folder in explorer</Button
			>
		</div>
		<PInput id="pack-id" label="ID" disabled :modelValue="activeRepo.pack.id" />
		<PInput id="pack-name" label="Name" v-model="activeRepo.pack.name" />
		<PInput id="pack-source" label="Source" v-model="activeRepo.pack.source" />
		<PInput
			id="pack-description"
			label="Description"
			v-model="activeRepo.pack.description"
		/>
		<Dependencies />
		<ImageCollection
			id="pack-preview"
			title="Preview"
			:imageCollection="activeRepo.pack.preview"
			folder="./"
		/>
		<Code :obj="activePack" />
	</div>
</template>
<style>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
