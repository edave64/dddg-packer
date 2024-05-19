<script setup lang="ts">
import { coreState } from "@/core-state";
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";
import { computed, type CSSProperties } from "vue";
import { joinNormalize } from "../../path-tools";
import ImageInput from "../shared/image-input.vue";

const props = defineProps({
	title: {
		type: String,
		default: "Image",
	},
	folder: {
		type: String,
		required: true,
	},
});

const model = defineModel<string | NsfwAbleImg>({
	required: true,
});

const previewStyle = computed((): CSSProperties => {
	let background = "";

	background += `no-repeat url(${joinNormalize(
		props.folder,
		img.value,
	)}?cache=${coreState.value?.mountedPackPath}) center / contain`;

	return {
		background,
	};
});

const img = computed({
	get(): string {
		if (typeof model.value === "string") {
			return model.value;
		}
		return model.value.img;
	},
	set(val: string) {
		if (img.value === val) return;
		if (typeof model.value === "string") {
			model.value = val;
			return;
		}
		model.value.img = val;
	},
});

const nsfw = computed({
	get(): boolean {
		if (typeof model.value === "string") {
			return false;
		}
		return model.value.nsfw;
	},
	set(val: boolean) {
		const m = model.value;
		if (val) {
			if (typeof m === "object" && m.nsfw) return;
			if (typeof m === "object") {
				m.nsfw = true;
				return;
			}
			model.value = {
				img: img.value,
				nsfw: true,
			};
		} else {
			if (m === img.value) return;
			model.value = img.value;
		}
	},
});
</script>
<template>
	<div class="img_splitter" v-if="model !== undefined">
		<div>
			<label from="sprite_images">{{ title }}:</label>
			<image-input label="Image path" v-model="img" />
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
