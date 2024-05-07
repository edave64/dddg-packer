<script setup lang="ts">
import { computed, type PropType } from "vue";
import { type JSONStyleGroup } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	styleGroup: {
		required: true,
		type: Object as PropType<JSONStyleGroup>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const f = computed(() => {
	return joinNormalize(props.folder, props.styleGroup.folder);
});
</script>
<template>
	<h2>Style group</h2>
	<p>
		<label for="style_group_id">ID: </label>
		<input id="style_group_id" v-model="styleGroup.id" />
	</p>
	<Code :obj="styleGroup" />
</template>
