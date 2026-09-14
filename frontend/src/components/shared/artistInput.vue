<script setup lang="ts">
import { Repo } from "@/repo/repo";
import { AutoComplete, type AutoCompleteCompleteEvent } from "primevue";
import { computed, onMounted, ref, type PropType } from "vue";

const value = defineModel<string[]>({
	type: Array as PropType<string[]>,
	required: true,
});
const searchText = ref("");
const isMounted = ref(false);

const allAuthors = computed(() => {
	if (!isMounted.value) return [];
	const text = searchText.value.toLowerCase();
	return Object.keys(Repo.allAuthors.value).filter((author) =>
		author.toLowerCase().includes(text),
	);
});

function search(event: AutoCompleteCompleteEvent) {
	searchText.value = event.query;
}

onMounted(() => {
	isMounted.value = true;
});

function onLeave() {
	const input = document.querySelector<HTMLInputElement>("#artistInput");
	if (!input) return;
	const inputValue = input.value;
	if (!inputValue) return;
	value.value.push(inputValue);
	input.value = "";
}
</script>
<template>
	<div style="display: flex; width: calc(100% - 8px); align-items: center">
		<label style="width: 96px" for="artistInput">Artists:</label>
		<AutoComplete
			class="artist-auto-complete"
			style="flex-grow: 1"
			inputId="artistInput"
			v-model="value"
			:suggestions="allAuthors"
			multiple
			:typeahead="allAuthors.length > 0"
			@complete="search"
			@blur="onLeave"
		/>
	</div>
</template>

<style scoped>
.artist-auto-complete {
	--p-autocomplete-background: var(--p-inputtext-filled-background);
}
</style>
