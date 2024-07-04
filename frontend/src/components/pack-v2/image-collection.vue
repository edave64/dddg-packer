<script setup lang="ts">
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, ref, watch, type CSSProperties, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import ImageInput from "../shared/image-input.vue";

const props = defineProps({
	imageCollection: {
		type: Array as PropType<string[] | undefined>,
	},
	title: {
		type: String,
		default: "Images",
	},
	folder: {
		type: String,
		required: true,
	},
});

const selectedImage = ref(-1);

const imageWithIdx = computed(() =>
	props.imageCollection?.map((x, i) => ({ idx: i, image: x })),
);

watch(
	() => props.imageCollection,
	(ary) => {
		if (!ary || ary.length === 0) selectedImage.value = -1;
		selectedImage.value = 0;
	},
	{ immediate: true },
);

const previewStyle = computed((): CSSProperties => {
	let background = "";
	if (!props.imageCollection) return {};

	for (const ic of props.imageCollection) {
		if (background) {
			background += ", ";
		}

		background += `no-repeat url(${joinNormalize(props.folder, ic)}) center / contain`;
	}

	return {
		background,
		"max-height": "50vh",
	};
});
</script>
<template>
	<div class="img_splitter" v-if="imageCollection">
		<div>
			<label from="sprite_images">{{ title }}:</label>
			<Listbox
				v-model="selectedImage"
				:options="imageWithIdx"
				optionValue="idx"
				:optionLabel="(x) => (x.image.length === 1 ? x.image[0] : x.image)"
				listStyle="max-height:256px"
			/>
			<Button
				@click="
					imageCollection.push('');
					selectedImage = imageCollection.length - 1;
				"
			>
				Add image
			</Button>
			<Button
				:disabled="imageCollection.length < 2"
				@click="imageCollection.splice(selectedImage, 1)"
			>
				Remove image</Button
			><br />
			<image-input
				label="Image path"
				:disabled="selectedImage === -1"
				v-model="imageCollection[selectedImage]"
			/>
		</div>
		<div class="sprite_preview" :style="previewStyle"></div>
	</div>
</template>

<style scoped>
fast-select {
	width: 256px;
	display: block;
}

.img_splitter {
	display: flex;
}
.sprite_preview {
	aspect-ratio: 1;
	flex-grow: 1;
}
</style>
