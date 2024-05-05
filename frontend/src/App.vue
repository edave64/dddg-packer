<script setup lang="ts">
import { computed, ref } from "vue";
import StartUp from "./components/StartUp.vue";
import SelectDDDG from "./components/SelectDDDG.vue";
import SelectPack from "./components/SelectPack.vue";
import EditPack from "./components/EditPack.vue";
import { TriggerCoreStateUpdate } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime";
import { type CoreState, type Stage } from "./coreState";

const coreState = ref(null as null | CoreState);
const stage = ref("startup" as Stage);

EventsOn("coreStateChanged", (newState: CoreState) => {
	console.log(newState);
	coreState.value = newState;
	if (newState.mountedPackPath) {
		stage.value = "pack";
	} else if (newState.dddgPath) {
		stage.value = "selectPack";
	} else {
		stage.value = "selectDDDG";
	}
});

TriggerCoreStateUpdate();
</script>

<template>
	<StartUp v-if="stage === 'startup'" />
	<SelectDDDG v-else-if="stage === 'selectDDDG'" :core-state="coreState!" />
	<SelectPack v-else-if="stage === 'selectPack'" :core-state="coreState!" />
	<EditPack v-else-if="stage === 'pack'" :core-state="coreState!" />
</template>

<style>
#logo {
	display: block;
	width: 50%;
	height: 50%;
	margin: auto;
	padding: 10% 0 0;
	background-position: center;
	background-repeat: no-repeat;
	background-size: 100% 100%;
	background-origin: content-box;
}
</style>
