<script setup lang="ts">
import { computed, type PropType } from "vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import Variations from "./variations.vue";
import PInput from "../shared/p-input.vue";
import type {
	JSONHeadCollection,
	JSONPoseMeta,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import ImageCollection from "./image-collection.vue";

type HeadDummy = Record<string, JSONHeadCollection>;
const props = defineProps({
	pose: {
		required: true,
		type: Object as PropType<JSONPoseMeta<HeadDummy>>,
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
	return joinNormalize(props.folder, props.pose.folder);
});
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>{{ pose.name }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to style</fast-tree-item>
	</teleport>
	<h2>Pose</h2>
	<PInput label="ID" v-model="pose.name" />
	<template v-if="'left' in pose">
		<Variations label="Left" :folder="f" :variants="pose.left" />
		<Variations label="Right" :folder="f" :variants="pose.right" />
	</template>
	<Variations
		v-if="'variant' in pose"
		label="Variants"
		:folder="f"
		:variants="pose.variant"
	/>
	<ImageCollection
		v-if="'static' in pose"
		label="Static"
		:folder="f"
		v-model="pose.static"
	/>
	<Code :obj="pose" />
</template>
