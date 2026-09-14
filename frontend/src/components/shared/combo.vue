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
	style: {},
});

const model = defineModel({});

interface IOptions {
	label: string;
	value: string;
}
</script>
<template>
	<label v-if="label" style="width: 96px">{{ label }}</label>
	<Select
		:id="`${id}-select`"
		:style
		v-model="model"
		:options="data"
		optionLabel="label"
		optionValue="value"
	/>
</template>
