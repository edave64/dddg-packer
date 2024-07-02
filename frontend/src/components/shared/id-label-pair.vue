<script setup lang="ts">
import { normalizeId } from "@/id-tools";
import PInput from "./p-input.vue";

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
});

const id = defineModel<string>("id", {
	default: "",
});

const label = defineModel<string>("label", {
	default: "",
});

function updateLabel(value: string) {
	const oldLabel = label.value;
	if (oldLabel && id.value === normalizeId(oldLabel)) {
		id.value = normalizeId(value);
	}
	label.value = value;
}
</script>
<template>
	<PInput
		label="Label"
		:model-value="label"
		@update:model-value="updateLabel"
		:disabled
	/>
	<PInput label="ID" type="id" v-model="id" :disabled />
</template>
<style scoped>
.code {
	font-family: monospace;
	user-select: text;
	-webkit-user-select: text;
	overflow-x: auto;
	width: 100%;
}
</style>
