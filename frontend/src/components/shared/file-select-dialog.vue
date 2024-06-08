<script setup lang="ts">
import { computed, ref } from "vue";
import type { IFileInfo } from "./file-tree";
import FileTree from "./file-tree.vue";

const props = defineProps({
	folder: {
		type: String,
		default: "./",
	},
});

const folderStructure = ref(null as null | IFileInfo);

const emit = defineEmits<{
	selected: [newVal: string];
	close: [];
}>();

const selected = ref(undefined as undefined | string);
const root = new URL("/mountedPack/", location.origin);

(async () => {
	const tree = await (
		await fetch(new URL(`${props.folder}*.json`, root))
	).json();
	folderStructure.value = tree;
	console.log(tree);
})();

const fullUrl = computed(() => {
	if (!selected.value) return "";
	return `${new URL(selected.value, new URL(props.folder, root))}`;
});
</script>
<template>
	<teleport to="#modalSlot">
		<fast-dialog>
			<div
				v-if="folderStructure"
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
						style="overflow: auto; flex: 1"
						@selected="selected = $event"
					/>
					<img :src="fullUrl" style="max-height: 50vh; flex: 1" />
				</div>
				<fast-button
					@click="$emit('selected', selected!)"
					:disabled="selected === undefined"
					>Confirm</fast-button
				>
				<fast-button @click="$emit('close')">Close</fast-button>
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
