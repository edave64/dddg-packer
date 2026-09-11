<script lang="ts" setup>
import type { IAuthor } from "@/repo";
import type { PropType } from "vue";
import PInput from "./p-input.vue";

const props = defineProps({
	authors: {
		required: true,
		type: Object as PropType<Record<string, IAuthor>>,
	},
	id: {
		type: String,
		required: true,
	},
});

defineEmits<{
	leave: [];
	delete: [];
	updateKey: [newName: string];
}>();

function setProperty<K extends keyof IAuthor>(key: K, value: string) {
	if (value === "" || value == null) {
		delete props.authors[props.id][key];
		return;
	}
	props.authors[props.id][key] = value;
}
</script>
<template>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to character</fast-tree-item>
	</teleport>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>Author '{{ id }}'</fast-breadcrumb-item>
	</teleport>
	<h2>Author</h2>
	<p>
		<PInput
			label="Name"
			:modelValue="id"
			@update:modelValue="$emit('updateKey', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Reddit"
			:modelValue="props.authors[id].reddit"
			@update:modelValue="setProperty('reddit', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Twitter"
			:modelValue="props.authors[id].twitter"
			@update:modelValue="setProperty('twitter', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Pixiv"
			:modelValue="props.authors[id].pixiv"
			@update:modelValue="setProperty('pixiv', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Deviantart"
			:modelValue="props.authors[id].deviantart"
			@update:modelValue="setProperty('deviantart', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Discord"
			:modelValue="props.authors[id].discord"
			@update:modelValue="setProperty('discord', $event)"
		/>
	</p>
	<p>
		<PInput
			type="foreignid"
			label="Website"
			:modelValue="props.authors[id].website"
			@update:modelValue="setProperty('website', $event)"
		/>
	</p>
</template>
