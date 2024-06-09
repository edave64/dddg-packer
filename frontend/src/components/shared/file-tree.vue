<script setup lang="ts">
import Tree, { type TreeSelectionKeys } from "primevue/tree";
import type { TreeNode } from "primevue/treenode";
import { computed, ref, watch, type PropType } from "vue";
import type { IFileInfo } from "./file-tree";

const props = defineProps({
	folderStructure: {
		type: Object as PropType<IFileInfo>,
		required: true,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
});

const nodes = computed((): TreeNode[] => {
	return props.folderStructure.isDir
		? props.folderStructure.children?.map((x) => toTreeNode(x)) ?? []
		: [];
});

function toTreeNode(node: IFileInfo, folder = "."): TreeNode {
	const path = `${folder}/${node.name}`;
	return {
		label: node.name,
		key: path,
		children: node.isDir
			? node?.children?.map((x) => toTreeNode(x, path))
			: undefined,
		expanded: true,
		selectable: !node.isDir,
	};
}

const selected = ref(undefined as undefined | TreeSelectionKeys);

watch(selected, (newVal) => {
	if (!newVal) return;
	emitSelected(newVal);
});

function emitSelected(selected: TreeSelectionKeys): void {
	console.log(selected);
	selected.value = selected;
	emit(
		"selected",
		Object.entries(selected)
			.filter((x) => (props.multiple ? x[1].checked : !!x[1]))
			.map((x) => x[0]),
	);
}

const emit = defineEmits<{
	selected: [string[]];
}>();
</script>
<template>
	<Tree
		:value="nodes"
		:selectionMode="multiple ? 'checkbox' : 'single'"
		v-model:selectionKeys="selected"
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
