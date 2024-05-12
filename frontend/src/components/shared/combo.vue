<script setup lang="ts">
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
});

const model = defineModel({});

interface IOptions {
	label: string;
	value: string;
}
</script>
<template>
	<fast-select @input="model = $event.target.value" :value="model">
		<fast-option
			v-for="(option, i) of data"
			:value="option.value"
			:key="`cb:${i}:${option.value}`"
		>
			{{ option.label }}
		</fast-option>
	</fast-select>
</template>
