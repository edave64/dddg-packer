<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { computed, ref } from "vue";
import type { IFileInfo } from "./file-tree";
import FileTree from "./file-tree.vue";

const props = defineProps({
	folder: {
		type: String,
		default: "./",
	},
	multiple: {
		type: Boolean,
		default: false,
	},
});

const folderStructure = ref(null as null | IFileInfo);

const emit = defineEmits<{
	selected: [newVal: string[]];
	close: [];
}>();

const selected = ref(undefined as undefined | string[]);
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
	return `${new URL(selected.value[0], new URL(props.folder, root))}`;
});
</script>
<template>
	<Dialog visible style="width: 90vw; height: 90vh">
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
			<div style="display: flex; overflow: hidden; width: 100%; height: 100%">
				<FileTree
					:folderStructure="folderStructure!"
					style="
						overflow: auto;
						flex: 1;
						min-width: 256px;
						max-height: 100%;
						overflow: auto;
					"
					:multiple
					@selected="selected = $event"
				/>
				<div>
					<img :src="fullUrl" style="max-width: 100%; max-height: 50vh" />
				</div>
			</div>
			<Button
				@click="$emit('selected', selected!)"
				:disabled="selected === undefined"
				>Confirm</Button
			>
			<Button @click="$emit('close')">Close</Button>
		</div>
	</Dialog>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

fast-dialog {
	z-index: 10000;
}
</style>
