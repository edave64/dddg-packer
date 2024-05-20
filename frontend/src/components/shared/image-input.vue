<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { IFileInfo } from "./file-tree";
import FileTree from "./file-tree.vue";

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

const folderStructure = ref(null as null | IFileInfo);

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
const root = new URL("/mountedPack/", location.origin);

(async () => {
	const tree = await (
		await fetch(new URL(`${props.folder}*.json`, root))
	).json();
	folderStructure.value = tree;
	console.log(tree);
})();

const fullUrl = computed(() => {
	if (!model.value) return "";
	return `${new URL(selected.value, new URL(props.folder, root))}`;
});
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
	<teleport to="#modalSlot" v-if="dlgOpen">
		<fast-dialog>
			<div
				style="
					padding: 0 10px 10px;
					color: var(--neutral-foreground-rest);
					display: flex;
					flex-direction: column;
					height: 100%;
				"
			>
				<h2>Select a file</h2>
				<div style="display: flex; overflow: hidden">
					<FileTree
						:folderStructure="folderStructure!"
						style="overflow: auto"
						@selected="selected = $event"
					/>
					<img :src="fullUrl" style="max-height: 50vh" />
				</div>
				<fast-button
					@click="
						model = selected;
						dlgOpen = false;
					"
					>Confirm</fast-button
				>
				<fast-button @click="dlgOpen = false">Close</fast-button>
			</div>
		</fast-dialog>
	</teleport>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

fast-dialog {
	z-index: 10000;
}
</style>
