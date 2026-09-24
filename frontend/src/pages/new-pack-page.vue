<script setup lang="ts">
import ArtistInput from "@/components/shared/artistInput.vue";
import PInput from "@/components/shared/p-input.vue";
import { normalizeId } from "@/id-tools";
import type { ISupportedRepo } from "@/repo";
import { Repo } from "@/repo/repo";
import { go } from "@/router";
import type { JSONContentPack } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { CreatePack } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const basedOn = computed(() => {
	return useRoute().params.basedOn;
});

const name = ref("");
const user = ref("");
const artist = ref([] as string[]);

const packIdCustomized = ref(false);

const packId = ref("");

const autoId = computed(() => {
	const nname = normalizeId(name.value);
	const nuser = normalizeId(user.value);
	const nartist = normalizeId(artist.value[0] ?? "");

	let ret = nname;
	if (nuser && nuser === nartist) {
		ret += `.${nuser}`;
	} else {
		if (nartist) {
			ret += `.${nartist}`;
		}
		if (nuser) {
			ret += `.${nuser}`;
		}
	}
	return ret;
});

watch(autoId, (newAuto, oldAuto) => {
	if (newAuto !== oldAuto && packId.value === oldAuto) {
		packId.value = newAuto;
	}
});

async function createPack() {
	const repo: ISupportedRepo = {
		$schema:
			"https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/repo_schema.json",
		authors: {},
		pack: {
			authors: [],
			characters: [],
			description: "",
			id: packId.value,
			name: name.value || "New pack",
			kind: [],
			preview: [],
			source: "",
			dddg2Path: "./index.json",
		},
	};

	const pack: JSONContentPack & { $schema: string } = {
		$schema:
			"https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/v2/schema.json",
		packId: packId.value,
		version: "2.0",
	};

	if (artist.value) {
		pack.authors = [...artist.value];
		const allAuthors = Repo.allAuthors.value;
		for (const a of artist.value) {
			repo.pack.authors.push(a);
			repo.authors[a] = { ...allAuthors[a] };
		}
	}

	await CreatePack(
		packId.value,
		JSON.stringify(repo, undefined, "\t"),
		JSON.stringify(pack, undefined, "\t"),
	);

	go("pack", { packId: packId.value });
}
</script>
<template>
	<h1>Create a new pack:</h1>
	<p v-if="basedOn">Cloned from {{ basedOn }}</p>
	<PInput id="pack-name" label="Name" v-model="name" />
	<PInput
		id="pack-creator"
		label="Pack Creator Name (You)"
		type="id"
		v-model="user"
	/>
	<ArtistInput id="pack-artist" v-model="artist" />
	<PInput
		id="pack-id"
		label="Pack id"
		v-model="packId"
		type="id"
		@update:model-value="packIdCustomized = true"
	/>
	<p>
		<Button @click="createPack">Create Pack</Button>
	</p>
</template>
