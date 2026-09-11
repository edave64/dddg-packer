<script lang="ts" setup>
import type { IAuthor } from "@/repo";

defineProps<{
	authors: {
		[key: string]: IAuthor;
	};
}>();

defineEmits<{
	authorClick: [author: string];
	createAuthor: [];
}>();
</script>
<template>
	<fast-tree-item
		v-if="Object.keys(authors).length === 0"
		@click="$emit('createAuthor')"
		>Add author</fast-tree-item
	>
	<fast-tree-item expanded v-else>
		Authors
		<fast-tree-item
			v-for="(_, key) in authors"
			:key="'author:' + key"
			@click="$emit('authorClick', key)"
		>
			{{ key }}
		</fast-tree-item>
		<fast-tree-item @click="$emit('createAuthor')">Add author</fast-tree-item>
	</fast-tree-item>
</template>
