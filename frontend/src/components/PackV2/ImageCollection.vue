<script setup lang="ts">
import { joinNormalize } from "../../path-tools";
import {
	computed,
	ref,
	watch,
	type CSSProperties,
	type PropType,
	type StyleValue,
} from "vue";
const props = defineProps({
	imageCollection: {
		type: Array as PropType<string[] | undefined>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const selectedImage = ref(-1);

watch(
	() => props.imageCollection,
	(ary) => {
		if (!ary || ary.length === 0) selectedImage.value = -1;
		selectedImage.value = 0;
	},
);

const previewStyle = computed((): CSSProperties => {
	let background = "";

	for (const ic of props.imageCollection!) {
		if (background) {
			background += ", ";
		}

		background += `no-repeat url(${joinNormalize(props.folder, ic)}) center / contain`;
	}

	return {
		background,
		height: "128px",
		width: "128px",
	};
});
</script>
<template>
	<div v-if="imageCollection">
		<label from="sprite_images">Images:</label>
		<select
			id="sprite_images"
			multiple
			@change="selectedImage = +($event.target as HTMLSelectElement).value"
		>
			<option
				v-for="(img, i) of imageCollection"
				:value="i"
				:selected="i == selectedImage"
			>
				{{ img }}
			</option>
		</select>
		<button
			@click="
				imageCollection.push('');
				selectedImage = imageCollection.length - 1;
			"
		>
			Add image
		</button>
		<button
			:disabled="imageCollection.length < 2"
			@click="imageCollection.splice(selectedImage, 1)"
		>
			Remove image</button
		><br />
		<label for="sprite_image">Image path:</label>
		<input
			id="sprite_image"
			:disabled="selectedImage === -1"
			v-model="imageCollection[selectedImage]"
		/>
		<div id="sprite_preview" :style="previewStyle"></div>
	</div>
</template>
