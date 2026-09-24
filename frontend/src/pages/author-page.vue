<script lang="ts" setup>
import { aryRemove } from "@/array-tools";
import PInput from "@/components/shared/p-input.vue";
import type { IAuthor } from "@/repo";
import { setTemporaryAlias } from "@/router";
import { useActivePack, useActiveRepo } from "@/store/active-pack";
import { computed } from "vue";
import { useRoute } from "vue-router";

function setProperty<K extends keyof IAuthor>(key: K, value: string) {
	const authorV = author.value;
	if (!authorV) return;

	if (value === "" || value == null) {
		delete authorV[key];
		return;
	}
	authorV[key] = value;
}

const route = useRoute();
const id = computed({
	get: () => route.params.authorId as string,
	set: (value) => {
		const repo = activeRepo.value;
		const pack = useActivePack().value;
		const authorV = author.value;
		const oldValue = id.value;
		if (!repo || !pack || !authorV) return;

		repo.authors[value] = authorV;
		setTemporaryAlias("authorId", oldValue, value);
		delete repo.authors[oldValue];

		aryRemove(repo.pack.authors, oldValue);
		repo.pack.authors.push(value);

		aryRemove(pack.authors, oldValue);
		pack.authors ??= [];
		pack.authors.push(value);
	},
});

const activeRepo = useActiveRepo();
const author = computed(() => {
	return activeRepo.value?.authors[id.value];
});
</script>
<template>
	<h2>Author</h2>
	<p>
		<PInput id="author-name" label="Name" v-model="id" />
	</p>
	<p>
		<PInput
			id="author-reddit"
			type="foreignid"
			label="Reddit"
			:modelValue="author?.reddit"
			@update:modelValue="setProperty('reddit', $event)"
		/>
	</p>
	<p>
		<PInput
			id="author-twitter"
			type="foreignid"
			label="Twitter"
			:modelValue="author?.twitter"
			@update:modelValue="setProperty('twitter', $event)"
		/>
	</p>
	<p>
		<PInput
			id="author-pixiv"
			type="foreignid"
			label="Pixiv"
			:modelValue="author?.pixiv"
			@update:modelValue="setProperty('pixiv', $event)"
		/>
	</p>
	<p>
		<PInput
			id="author-deviantart"
			type="foreignid"
			label="Deviantart"
			:modelValue="author?.deviantart"
			@update:modelValue="setProperty('deviantart', $event)"
		/>
	</p>
	<p>
		<PInput
			id="author-discord"
			type="foreignid"
			label="Discord"
			:modelValue="author?.discord"
			@update:modelValue="setProperty('discord', $event)"
		/>
	</p>
	<p>
		<PInput
			id="author-website"
			type="foreignid"
			label="Website"
			:modelValue="author?.website"
			@update:modelValue="setProperty('website', $event)"
		/>
	</p>
</template>
