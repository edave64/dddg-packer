<script setup lang="ts">
import { ref, watch } from "vue";
import { TriggerCoreStateUpdate } from "../wailsjs/go/main/App";
import EditPack from "./components/edit-pack.vue";
import SelectDDDG from "./components/select-dddg.vue";
import SelectPack from "./components/select-pack.vue";
import StartUp from "./components/start-up.vue";
import { coreState, type Stage } from "./core-state";

const stage = ref("startup" as Stage);

watch(
	() => coreState.value,
	(newState) => {
		if (!newState) return;
		if (newState.mountedPackPath) {
			stage.value = "pack";
		} else if (newState.dddgPath) {
			stage.value = "selectPack";
		} else {
			stage.value = "selectDDDG";
		}
	},
);

TriggerCoreStateUpdate();
</script>

<template>
	<header>
		<fast-breadcrumb id="breadcrumb" separator=">"></fast-breadcrumb>
	</header>
	<StartUp v-if="stage === 'startup'" />
	<SelectDDDG v-else-if="stage === 'selectDDDG'" :core-state="coreState!" />
	<SelectPack v-else-if="stage === 'selectPack'" :core-state="coreState!" />
	<EditPack v-else-if="stage === 'pack'" :core-state="coreState!" />
	<div id="modalSlot"></div>
</template>

<style>
#app {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}
</style>
