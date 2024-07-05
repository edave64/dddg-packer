<template>
	<template
		v-if="
			(!json.characters || json.characters.length === 0) &&
			expandables.length === 0
		"
	>
		<fast-tree-item @click="createCharacter">Add character</fast-tree-item>
	</template>
	<fast-tree-item expanded v-else>
		Characters
		<fast-tree-item
			v-for="char in json.characters!"
			:key="'char:' + char.id"
			@click="$emit('updateState', { t: 'char', obj: char })"
		>
			{{ char.label ? `${char.label} [${char.id}]` : char.id }}
		</fast-tree-item>
		<fast-tree-item @click="createCharacter">Add character</fast-tree-item>
		<fast-tree-item
			v-for="char in expandables"
			:key="char.id"
			@click="extendChar(char)"
			>Extend {{ char.label }}</fast-tree-item
		>
	</fast-tree-item>
</template>
<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import { normalizeId } from "@/id-tools";
import type { INormalizedPack } from "@/normalized-dependencies";
import type { ISupportedRepo } from "@/repo";
import type {
	JSONCharacter,
	JSONContentPack as V2Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { computed, type PropType } from "vue";

const props = defineProps({
	json: {
		required: true,
		type: Object as PropType<V2Json>,
	},
	repo: {
		required: true,
		type: Object as PropType<ISupportedRepo>,
	},
	depTree: {
		required: true,
		type: Object as PropType<INormalizedPack>,
	},
});

const emit = defineEmits<{
	updateState: [newState: { t: "char"; obj: JSONCharacter }];
	addKind: [kind: "Characters"];
}>();

const expandables = computed(() => {
	return props.depTree.characters.filter(
		(x) => !props.json.characters?.find((y) => y.id === x.id),
	);
});

function createCharacter() {
	if (!props.json.characters) {
		props.json.characters = [];
	}
	const label =
		props.json.characters.length === 0 ? props.repo.pack.name : "Character";
	let id = normalizeId(label);
	if (props.json.characters.some((x) => x.id === id)) {
		id = seekFreeIds(
			"character",
			props.json.characters?.map((x) => x.id),
		);
	}
	const obj: JSONCharacter = {
		id,
		label,
	};
	props.json.characters.push(obj);
	props.repo.pack.characters.push(obj.label as string);
	emit("addKind", "Characters");
	emit("updateState", {
		t: "char",
		obj,
	});
}

function extendChar(char: INormalizedPack["characters"][0]) {
	if (!props.json.characters) {
		props.json.characters = [];
	}
	props.repo.pack.characters.push(char.label);
	const obj: JSONCharacter = {
		id: char.id,
	};
	props.json.characters.push(obj);
	emit("updateState", {
		t: "char",
		obj,
	});
}
</script>
