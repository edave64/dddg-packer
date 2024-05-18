<script setup lang="ts">
import { computed, type PropType } from "vue";
import type {
	JSONBackground,
	JSONSprite,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./image-collection.vue";
import Variations from "./variations.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import PInput from "../shared/p-input.vue";
import { Confirm } from "@wails/go/main/App";

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
			"Deleting background"
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
	<PInput label="ID" v-model="background.id" />
	<PInput label="Label" v-model="background.label" />
	<Variations :variants="background.variants" label="Variants" :folder="f" />
	<fast-button @click="deleteThis">Delete background</fast-button>
	<Code :obj="background" />
</template>
