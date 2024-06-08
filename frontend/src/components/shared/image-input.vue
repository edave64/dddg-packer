<script setup lang="ts">
import { ref, watch } from "vue";
import FileSelectDialog from "./file-select-dialog.vue";

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
	folder: {
		type: String,
		default: "./",
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const model = defineModel({
	type: String,
});
const selected = ref(undefined as undefined | string);

watch(
	() => model.value,
	(newVal) => {
		selected.value = newVal;
	},
	{ immediate: true },
);

const dlgOpen = ref(false);
</script>
<template>
	<div style="display: flex; align-items: end">
		<fast-text-field
			class="fast-field"
			appearance="filled"
			:placeholder="placeholder ?? label"
			:value="model"
			:disabled="disabled"
			@input="model = $event.target.value"
			>{{ label }}</fast-text-field
		>
		<fast-button :disabled="disabled" @click="dlgOpen = true">...</fast-button>
	</div>
	<file-select-dialog
		v-if="dlgOpen"
		:folder="folder"
		@selected="
			model = $event;
			dlgOpen = false;
		"
		@close="dlgOpen = false"
	/>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

fast-dialog {
	z-index: 10000;
}
</style>
