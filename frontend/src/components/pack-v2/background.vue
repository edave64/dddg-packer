<script setup lang="ts">
import type { JSONBackground } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, toRef, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import Variations from "./variations.vue";
import IdLabelPair from "../shared/id-label-pair.vue";

const props = defineProps({
	background: {
		required: true,
		type: Object as PropType<JSONBackground>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	leave: [];
	delete: [];
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.background.folder);
});

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this background? This cannot be undone.",
			"Deleting background",
		)
	) {
		emit("delete");
	}
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>{{ background.id }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to pack</fast-tree-item>
	</teleport>
	<h2>Background</h2>
	<IdLabelPair v-model:id="background.id" v-model:label="background.label" />
	<Variations :variants="background.variants" label="Variants" :folder="f" />
	<Button @click="deleteThis">Delete background</Button>
	<Code :obj="background" />
</template>
