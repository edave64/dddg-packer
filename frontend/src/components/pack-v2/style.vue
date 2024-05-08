<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONStyle } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	style: {
		required: true,
		type: Object as PropType<JSONStyle>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const f = computed(() => {
	return joinNormalize(props.folder, props.style.folder);
});
</script>
<template>
	<h2>Style</h2>
	<p></p>
	<Code :obj="style" />
</template>
