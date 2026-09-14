<script setup lang="ts">
import { Repo } from "@/repo/repo";
import { useActivePack } from "@/store/active-pack";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Listbox from "primevue/listbox";
import { computed, ref } from "vue";

const activePack = useActivePack();

const selectorOpen = ref(false);
const allPacks = Repo.allPacks;

const selectedPack = ref("");

function addDependency() {
	const pack = activePack.value;
	if (!pack) return;
	if (!pack.dependencies) {
		pack.dependencies = [selectedPack.value];
	} else {
		if (pack.dependencies?.includes(selectedPack.value)) {
			return;
		}
		pack.dependencies.push(selectedPack.value);
	}
}

const dependencies = computed(() => {
	const pack = activePack.value;
	if (!pack) return [];
	return (pack.dependencies as string[]) ?? [];
});
</script>
<template>
	<fieldset v-if="dependencies.length > 0">
		<legend>Dependencies</legend>
		<Listbox :options="dependencies" optionsLabel="id" optionsKey="id" />
		<Button @click="selectorOpen = true">Add dependency</Button>
	</fieldset>
	<Button v-else @click="selectorOpen = true">Add dependency</Button>
	<Dialog
		v-model:visible="selectorOpen"
		modal
		dismissableMask
		closeOnEscape
		header="Add dependency"
	>
		<Listbox
			v-model="selectedPack"
			filter
			:options="allPacks"
			optionLabel="id"
			optionValue="id"
			listStyle="max-height: 50vh"
		/>
		<Button @click="addDependency()">Add dependency</Button>
		<Button @click="selectorOpen = false">Cancel</Button>
	</Dialog>
</template>
