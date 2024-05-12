<script setup lang="ts">
const props = defineProps({
	label: {
		type: String,
	},
	placeholder: {
		type: String,
	},
});

const model = defineModel({ type: Number });
</script>
<template>
	<fast-number-field
		class="fast-field"
		appearance="filled"
		:placeholder="placeholder ?? label"
		:value="model"
		@input="model = +$event.target.value"
		>{{ label }}</fast-number-field
	>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}
</style>
