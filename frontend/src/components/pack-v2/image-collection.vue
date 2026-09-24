<script setup lang="ts">
import ImageInput from "@/components/shared/image-input.vue";
import { joinNormalize } from "@/path-tools";
import { usePackId } from "@/store/active-pack";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, ref, watch, type CSSProperties, type PropType } from "vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
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

const packId = usePackId();

const previewStyle = computed((): CSSProperties => {
	let background = "";
	if (!props.imageCollection) return {};

	const base = joinNormalize(packId.value ?? "", "./");
	const f = joinNormalize(packId.value ?? "", base, props.folder);
	for (const ic of props.imageCollection) {
		if (background) {
			background += ", ";
		}

		background += `no-repeat url(${encodeURI(
			`${joinNormalize(packId.value ?? "", f, ic)}?cache=${packId.value}`,
		)}) center / contain`;
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
			<label :for="`${id}-listbox`">{{ title }}:</label>
			<Listbox
				:id="`${id}-listbox`"
				v-model="selectedImage"
				:options="imageWithIdx"
				optionValue="idx"
				:optionLabel="
					(x) => (x.image.length === 1 ? x.image[0] : x.image)
				"
				listStyle="max-height:256px"
			/>
			<Button
				:id="`${id}-add`"
				@click="
					imageCollection.push('');
					selectedImage = imageCollection.length - 1;
				"
			>
				Add image
			</Button>
			<Button
				:id="`${id}-remove`"
				:disabled="imageCollection.length < 2"
				@click="imageCollection.splice(selectedImage, 1)"
			>
				Remove image</Button
			><br />
			<image-input
				:id="`${id}-image-path`"
				label="Image path"
				:disabled="selectedImage === -1"
				v-model="imageCollection[selectedImage]"
			/>
		</div>
		<div class="sprite_preview" :style="previewStyle"></div>
	</div>
</template>

<style scoped>
.img_splitter {
	display: flex;
}
.sprite_preview {
	aspect-ratio: 1;
	flex-grow: 1;
}
</style>
