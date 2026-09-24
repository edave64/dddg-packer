<script setup lang="ts">
import { Select } from "primevue";
import type { PropType } from "vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	label: {
		type: String,
	},
	placeholder: {
		type: String,
	},
	data: {
		type: Array as PropType<IOptions[]>,
		required: true,
	},
	editable: {
		type: Boolean,
		default: false,
	},
});

const model = defineModel({
	type: String,
	required: true,
});

export interface IOptions {
	label: string;
	value: string;
}
</script>
<template>
	<div style="display: flex; width: calc(100% - 8px); align-items: center">
		<label v-if="label" style="width: 96px">{{ label }}</label>
		<Select
			class="combo-box"
			style="flex-grow: 1"
			:id="`${id}-select`"
			v-model="model"
			:options="data"
			:editable="editable"
			optionLabel="label"
			optionValue="value"
		/>
	</div>
</template>

<style scoped>
.combo-box {
	--p-select-background: var(--p-inputtext-filled-background);
}
</style>
