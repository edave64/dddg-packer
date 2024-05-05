<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
const props = defineProps({
	imageCollection: {
		type: Array as PropType<string[] | undefined>,
	},
});

const emit = defineEmits<{}>();
const selectedImage = ref(-1);

watch(
	() => props.imageCollection,
	(ary) => {
		if (!ary || ary.length === 0) selectedImage.value = -1;
		selectedImage.value = 0;
	},
);
</script>
<template>
	<p v-if="imageCollection">
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
			Remove image
		</button>
		<label for="sprite_image">Image path:</label>
		<input id="sprite_image" v-model="imageCollection[selectedImage]" />
	</p>
</template>
