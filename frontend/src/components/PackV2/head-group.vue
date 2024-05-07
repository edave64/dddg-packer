<script setup lang="ts">
import { computed, type PropType } from "vue";
import { type JSONHeadCollection } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./ImageCollection.vue";
import Variations from "./variations.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	headGroup: {
		required: true,
		type: Object as PropType<JSONHeadCollection | string[][]>,
	},
	id: {
		type: String,
		required: true,
	},
	folder: {
		type: String,
		required: true,
	},
});
const emit = defineEmits<{
	updateKey: [newName: string];
}>();

const f = computed(() => {
	return joinNormalize(
		props.folder,
		Array.isArray(props.headGroup) || !props.headGroup
			? undefined
			: props.headGroup.folder,
	);
});
</script>
<template>
	<h2>Head group</h2>
	<p>
		<label for="head_id">ID: </label>
		<input
			id="head_id"
			:value="id"
			@input="$emit('updateKey', ($event.target as HTMLInputElement).value)"
		/>
	</p>
	<Variations
		:variants="
			Array.isArray(headGroup) || !headGroup ? headGroup : headGroup.variants
		"
		label="Variants"
		:folder="f"
	/>
	<Code :obj="headGroup" />
</template>
