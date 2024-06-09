<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import type { PropType } from "vue";

const props = defineProps({
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
	<Dropdown
		:style
		v-model="model"
		:options="data"
		optionLabel="label"
		optionValue="value"
	/>
</template>
