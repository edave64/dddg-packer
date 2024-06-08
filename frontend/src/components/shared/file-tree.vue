<script setup lang="ts">
import type { PropType } from "vue";
import type { IFileInfo } from "./file-tree";

const props = defineProps({
	folderStructure: {
		type: Object as PropType<IFileInfo>,
		required: true,
	},
	subStructure: {
		type: String,
		default: "",
	},
});

const layerPath = `${props.subStructure}/${props.folderStructure.name}`;

const emit = defineEmits<{
	selected: [string];
}>();
</script>
<template>
	<fast-tree-view v-if="subStructure === ''">
		{{ folderStructure.name }}
		<FileTree
			v-if="folderStructure.isDir && folderStructure.children"
			v-for="child of folderStructure.children"
			:key="'f:' + layerPath + '/' + child.name"
			:folderStructure="child"
			subStructure="."
			@selected-change="
				if ($event.detail?._selected) {
					emit('selected', $event.detail?.getAttribute('value')!);
				}
			"
		/>
	</fast-tree-view>
	<fast-tree-item expanded v-else>
		{{ folderStructure.name }}
		<FileTree
			v-if="folderStructure.isDir && folderStructure.children"
			v-for="child of folderStructure.children"
			:value="layerPath + '/' + child.name"
			:key="'f:' + layerPath + '/' + child.name"
			:folderStructure="child"
			:subStructure="layerPath"
		/>
	</fast-tree-item>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

fast-dialog {
	z-index: 10000;
}
</style>
