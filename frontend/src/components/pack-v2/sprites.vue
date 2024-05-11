<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./image-collection.vue";
import Variations from "./variations.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import PInput from "../shared/p-input.vue";

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
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.sprite.folder);
});
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>{{ sprite.id }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to pack</fast-tree-item>
	</teleport>
	<h2>Sprite</h2>
	<PInput label="ID" v-model="sprite.id" />
	<PInput label="Label" v-model="sprite.label" />
	<ImageCollection
		v-if="sprite.variants?.length === 1"
		:imageCollection="sprite.variants[0]"
		:folder="f"
	/>
	<Variations :variants="sprite.variants" label="Variants" :folder="f" v-else />
	<Code :obj="sprite" />
</template>
