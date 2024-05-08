<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONStyle } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
});

const model = defineModel({});
</script>
<template>
	<fast-text-field
		class="fast-field"
		appearance="filled"
		:placeholder="placeholder ?? label"
		:value="model"
		@input="model = $event.target.value"
		>{{ label }}</fast-text-field
	>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}
</style>
