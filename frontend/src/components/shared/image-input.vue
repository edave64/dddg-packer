<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref, watch } from "vue";
import FileSelectDialog from "./file-select-dialog.vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
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
		<InputText
			:id="`${id}-input`"
			class="fast-field"
			:placeholder="placeholder ?? label"
			v-model="model"
			:disabled="disabled"
			variant="filled"
		/>
		<Button :id="`${id}-button`" :disabled="disabled" @click="dlgOpen = true"
			>...</Button
		>
	</div>
	<file-select-dialog
		v-model:visible="dlgOpen"
		:folder="folder"
		:filter="/\.png|jpe?g|webp$/i"
		@selected="
			model = $event[0];
			dlgOpen = false;
		"
	/>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}
</style>
