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
<template>@click="$emit('authorClick', key)"</template>
