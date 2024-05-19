<script setup lang="ts">
import { coreState } from "@/core-state";
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

		background += `no-repeat url(${joinNormalize(props.folder, ic)}?cache=${
			coreState.value?.mountedPackPath
		}) center / contain`;
	}

	return {
		background,
	};
});
</script>
<template>
	<div class="img_splitter" v-if="imageCollection">
		<div>
			<label from="sprite_images">{{ title }}:</label>
			<fast-select
				size="5"
				id="sprite_variants"
				@input="selectedImage = $event.target.selectedIndex"
			>
				<fast-option
					v-for="(variant, i) of imageCollection"
					:value="i"
					:selected="i === selectedImage"
					@select="console.log($event)"
					@input="console.log($event)"
					@change="console.log($event)"
				>
					{{ variant.length === 1 ? variant[0] : variant }}
				</fast-option>
			</fast-select>
			<fast-button
				@click="
					imageCollection.push('');
					selectedImage = imageCollection.length - 1;
				"
			>
				Add image
			</fast-button>
			<fast-button
				:disabled="imageCollection.length < 2"
				@click="imageCollection.splice(selectedImage, 1)"
			>
				Remove image</fast-button
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
	aspect-ration: 1;
	flex-grow: 1;
}
</style>
