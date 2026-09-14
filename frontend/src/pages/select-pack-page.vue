<script setup lang="ts">
import { href } from "@/router";
import { ref, watch } from "vue";
import { GetPacks } from "../../wailsjs/go/main/App";
import { dddgPath } from "../store/core-state";
const packs = ref(null as null | string[]);

watch(() => dddgPath, updatePacks, { immediate: true });
async function updatePacks() {
	try {
		const newPacks = await GetPacks();
		packs.value = newPacks;
	} catch (e) {
		packs.value = [];
		throw e;
	}
}
</script>
<template>
	<p>
		DDDG location: {{ dddgPath }}
		<a :href="href('select-dddg')">[change]</a>
	</p>
	<h1>Create a new pack:</h1>
	<ul>
		<li>
			<a :href="href('new-pack')">Create a new pack</a>
		</li>
	</ul>
	<h1>Select pack to edit:</h1>
	<p v-if="packs === null">Loading list...</p>
	<p v-else-if="packs.length === 0">No packs</p>
	<ul v-else>
		<li v-for="pack in packs" :key="pack">
			<a :href="href('pack', { packId: pack })">{{ pack }}</a>
		</li>
	</ul>
</template>
