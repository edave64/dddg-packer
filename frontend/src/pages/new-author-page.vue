<script setup lang="ts">
import { Repo } from "@/repo/repo";
import { go } from "@/router";
import { useActivePack, useActiveRepo } from "@/store/active-pack";
import { AutoComplete, Button, type AutoCompleteCompleteEvent } from "primevue";
import { computed, ref } from "vue";

const searchText = ref("");
const value = ref<string>("");

const allAuthors = computed(() => {
	const text = searchText.value.toLowerCase();
	return Object.keys(Repo.allAuthors.value).filter((author) =>
		author.toLowerCase().includes(text),
	);
});

function search(event: AutoCompleteCompleteEvent) {
	searchText.value = event.query;
}

function addAuthor() {
	const authorName = value.value;
	if (value.value.length === 0) return;

	const packV = useActivePack().value;
	const repo = useActiveRepo().value;
	if (!packV || !repo) return;

	if (packV.authors?.includes(authorName)) {
		go("author", { packId: packV.packId!, authorId: authorName });
		return;
	}

	packV.authors ??= [];
	packV.authors.push(authorName);
	repo.pack.authors ??= [];
	repo.pack.authors.push(authorName);

	repo.authors[authorName] = { ...Repo.allAuthors.value[authorName] };
	go("author", { packId: packV.packId!, authorId: authorName });
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
			:typeahead="allAuthors.length > 0"
			@complete="search"
		/>
	</div>
	<Button label="Add" @click="addAuthor" />
</template>

<style scoped>
.artist-auto-complete {
	--p-autocomplete-background: var(--p-inputtext-filled-background);
}
</style>
