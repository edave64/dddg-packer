<script setup lang="ts">
import type { INormalizedCharacter } from "@/normalized-dependencies";
import type { JSONHeadCollections } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import Variations from "./variations.vue";

const props = defineProps({
	headGroup: {
		required: true,
		type: Object as PropType<JSONHeadCollections[string]>,
	},
	id: {
		type: String,
		required: true,
	},
	folder: {
		type: String,
		required: true,
	},
	depChar: {
		type: Object as PropType<INormalizedCharacter>,
	},
});
const emit = defineEmits<{
	updateKey: [newName: string];
	leave: [];
	delete: [];
}>();

const f = computed(() => {
	return joinNormalize(
		props.folder,
		Array.isArray(props.headGroup) || !props.headGroup
			? undefined
			: props.headGroup.folder,
	);
});

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this head group? This cannot be undone.",
			"Deleting head group",
		)
	) {
		emit("delete");
	}
}

const isExtension = computed(() => {
	if (!props.depChar) return false;
	return !!props.depChar.headGroups.find((x) => x.id === props.id);
});
</script>
<template>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to character</fast-tree-item>
	</teleport>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>Head group '{{ id }}'</fast-breadcrumb-item>
	</teleport>
	<h2>Head group</h2>
	<p>
		<PInput
			label="ID"
			type="id"
			:modelValue="id"
			:disabled="isExtension"
			@update:modelValue="$emit('updateKey', $event)"
		/>
	</p>
	<Variations
		:variants="
			Array.isArray(headGroup) || !headGroup ? headGroup : headGroup.variants
		"
		label="Variants"
		:folder="f"
	/>
	<Button @click="deleteThis">Delete head group</Button>
	<Code :obj="headGroup" />
</template>
