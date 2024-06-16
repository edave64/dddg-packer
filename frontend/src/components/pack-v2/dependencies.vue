<script setup lang="ts">
import { Repo } from "@/repo/repo";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Listbox from "primevue/listbox";
import { ref, type PropType } from "vue";

const props = defineProps({
	dependencies: {
		required: true,
		type: Array as PropType<Array<string>>,
	},
});

const selectorOpen = ref(false);
const allPacks = Repo.allPacks;

const selectedPack = ref("");

function addDependency() {
	if (props.dependencies?.includes(selectedPack.value)) {
		return;
	}
	props.dependencies.push(selectedPack.value);
}
</script>
<template>
	<fieldset v-if="dependencies && dependencies.length > 0">
		<legend>Dependencies</legend>
		<Listbox :options="dependencies" optionsLabel="id" optionsKey="id" />
		<Button @click="selectorOpen = true">Add dependency</Button>
	</fieldset>
	<Button v-else @click="selectorOpen = true">Add dependency</Button>
	<Dialog v-if="selectorOpen" visible header="Add dependency">
		<Listbox
			v-model="selectedPack"
			:options="allPacks"
			optionLabel="id"
			optionValue="id"
			listStyle="max-height: 50vh"
		/>
		<Button @click="addDependency()">Add dependency</Button>
		<Button @click="selectorOpen = false">Cancel</Button>
	</Dialog>
</template>
