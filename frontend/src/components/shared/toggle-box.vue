<script setup lang="ts">
const props = defineProps({
	label: {
		type: String,
	},
});

const model = defineModel({ type: Boolean });
</script>
<template>
	<fast-checkbox :checked="model" @change="model = $event.target.checked">{{
		label
	}}</fast-checkbox>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}
</style>
