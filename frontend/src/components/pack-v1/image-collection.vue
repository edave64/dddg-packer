<script setup lang="ts">
import ImageInput from "@/components/shared/image-input.vue";
import { joinNormalize } from "@/path-tools";
import { usePackId } from "@/store/active-pack";
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";
import { computed, type CSSProperties } from "vue";

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

const packId = usePackId();

const model = defineModel<string | NsfwAbleImg>({
	required: true,
});

const previewStyle = computed((): CSSProperties => {
	let background = "";

	const base = joinNormalize(packId.value ?? "", "./");
	const f = joinNormalize(packId.value ?? "", base, props.folder);

	background += `no-repeat url(${encodeURI(
		`${joinNormalize(packId.value ?? "", f, img.value)}?cache=${packId.value}`,
	)}) center / contain`;

	return {
		background,
		"max-height": "50vh",
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
			<label from="sprite-img">{{ title }}:</label>
			<image-input id="sprite-img" label="Image path" v-model="img" />
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
