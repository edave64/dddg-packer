<script setup lang="ts">
import type { JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import IdLabelPair from "../shared/id-label-pair.vue";
import ImageCollection from "./image-collection.vue";
import Variations from "./variations.vue";

const props = defineProps({
	sprite: {
		required: true,
		type: Object as PropType<JSONSprite>,
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
	return joinNormalize(props.folder, props.sprite.folder);
});

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this sprite? This cannot be undone.",
			"Deleting sprite",
		)
	) {
		emit("delete");
	}
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>{{ sprite.id }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to pack</fast-tree-item>
	</teleport>
	<h2>Sprite</h2>
	<IdLabelPair v-model:id="sprite.id" v-model:label="sprite.label" />
	<ImageCollection
		v-if="sprite.variants?.length === 1"
		:imageCollection="sprite.variants[0]"
		:folder="f"
	/>
	<Variations :variants="sprite.variants" label="Variants" :folder="f" v-else />
	<Button @click="deleteThis">Delete sprite</Button>
	<Code :obj="sprite" />
</template>
