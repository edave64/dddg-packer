<script setup lang="ts">
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
