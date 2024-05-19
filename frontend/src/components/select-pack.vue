<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { GetPacks, MountPack, UpdateDddgPath } from "../../wailsjs/go/main/App";
import type { main } from "../../wailsjs/go/models";
import type { CoreState } from "../core-state";
const packs = ref(null as null | main.Pack[]);
const props = defineProps({
	coreState: {
		required: true,
		type: Object as PropType<CoreState>,
	},
});

watch(() => props.coreState, updatePacks, { immediate: true });
async function updatePacks() {
	try {
		const newPacks = await GetPacks();
		packs.value = newPacks;
	} catch (e) {
		packs.value = [];
		throw e;
	}
}

function openPack(id: string) {
	MountPack(id);
}

function createPack() {}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>Packs</fast-breadcrumb-item>
	</teleport>
	<p>
		DDDG location: {{ coreState.dddgPath }}
		<a href="#" @click="UpdateDddgPath()">[change]</a>
	</p>
	<h1>Create a new pack:</h1>
	<ul>
		<li>Create empty pack</li>
		<li>Create from image folder</li>
	</ul>
	<h1>Select pack to edit:</h1>
	<p v-if="packs === null">Loading list...</p>
	<p v-else-if="packs.length === 0">No packs</p>
	<ul v-else>
		<li v-for="pack in packs" :key="pack.id">
			<a href="#" @click="openPack(pack.id)">{{ pack.id }}</a>
			<a href="#" @click="createPack(pack.id)" style="padding-left: 8px"
				>[Clone]</a
			>
		</li>
	</ul>
</template>
