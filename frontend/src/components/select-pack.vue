<script setup lang="ts">
import { normalizeId } from "@/id-tools";
import type { ISupportedRepo } from "@/repo";
import type { JSONContentPack } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { ref, watch, type PropType } from "vue";
import {
	CreatePack,
	GetPacks,
	MountPack,
	UpdateDddgPath,
} from "../../wailsjs/go/main/App";
import type { main } from "../../wailsjs/go/models";
import type { CoreState } from "../core-state";
import PInput from "./shared/p-input.vue";
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

type State = null | {
	t: "create-pack";
	basedOn?: string;
};

const state = ref(null as State);

const name = ref("");
const user = ref("");
const artist = ref("");

const packIdCustomized = ref(false);

const packId = ref("");

watch(
	() => [packIdCustomized.value, name.value, user.value, artist.value],
	() => {
		if (packIdCustomized.value) return;

		const nname = normalizeId(name.value);
		const nuser = normalizeId(user.value);
		const nartist = normalizeId(artist.value);

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
		packId.value = ret;
	},
);

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
			name: "New pack",
			preview: [],
			source: "",
			dddg2Path: "index.json",
		},
	};

	if (artist.value) {
		repo.pack.authors.push(artist.value);
		repo.authors[artist.value] = {};
	}

	const pack: JSONContentPack & { $schema: string } = {
		$schema:
			"https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/v2/schema.json",
		packId: packId.value,
		version: "2.0",
	};

	await CreatePack(
		packId.value,
		JSON.stringify(repo, undefined, "\t"),
		JSON.stringify(pack, undefined, "\t"),
	);

	MountPack(packId.value);
}
</script>
<template>
	<template v-if="state === null">
		<teleport to="#breadcrumb">
			<fast-breadcrumb-item>Packs</fast-breadcrumb-item>
		</teleport>
		<p>
			DDDG location: {{ coreState.dddgPath }}
			<a href="#" @click="UpdateDddgPath()">[change]</a>
		</p>
		<h1>Create a new pack:</h1>
		<ul>
			<li>
				<a href="#" @click="state = { t: 'create-pack' }">Create empty pack</a>
			</li>
			<li>Create from image folder</li>
		</ul>
		<h1>Select pack to edit:</h1>
		<p v-if="packs === null">Loading list...</p>
		<p v-else-if="packs.length === 0">No packs</p>
		<ul v-else>
			<li v-for="pack in packs" :key="pack.id">
				<a href="#" @click="openPack(pack.id)">{{ pack.id }}</a>
				<a
					href="#"
					@click="state = { t: 'create-pack', basedOn: pack.id }"
					style="padding-left: 8px"
					>[Clone]</a
				>
			</li>
		</ul>
	</template>
	<template v-else-if="state.t === 'create-pack'">
		<teleport to="#breadcrumb">
			<fast-breadcrumb-item href="#" @click="state = null"
				>Packs</fast-breadcrumb-item
			>
			<fast-breadcrumb-item>Create new pack</fast-breadcrumb-item>
		</teleport>
		<h1>Create a new pack:</h1>
		<p v-if="state.basedOn">Cloned from {{ state.basedOn }}</p>
		<PInput label="Name" v-model="name" />
		<PInput label="Pack Creator Name (You)" v-model="user" />
		<PInput label="Artist" v-model="artist" />
		<PInput
			label="Pack id"
			v-model="packId"
			type="id"
			@update:model-value="packIdCustomized = true"
		/>
		<p>
			<Button @click="createPack">Create Pack</Button>
		</p>
	</template>
</template>
