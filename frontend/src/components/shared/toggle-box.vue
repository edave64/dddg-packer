<script setup lang="ts">
import Checkbox from "primevue/checkbox";

const props = defineProps({
	label: {
		type: String,
	},
});

const model = defineModel({ type: Boolean });
</script>
<template>
	<p>
		<Checkbox v-model="model" binary />
		<label v-if="label">{{ label }}</label>
	</p>
</template>
