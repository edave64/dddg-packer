<script setup lang="ts">
import { joinNormalize } from "@/path-tools";
import { UploadFile } from "@wails/go/main/App";
import Button from "primevue/button";
import { ref } from "vue";
import FileSelectDialog from "../shared/file-select-dialog.vue";
import ImageInput from "../shared/image-input.vue";

const props = defineProps({
	folder: {
		type: String,
		required: true,
	},
});

const selectorOpen = ref(false);

const modelValue = defineModel({
	type: String,
});

async function generateChibi(baseImage: string) {
	const img = await loadImage(`/mountedPack/${baseImage}`);
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not get context");
	ctx.drawImage(img, 0, 0);
	const data = ctx.getImageData(0, 0, img.width, img.height).data;

	// Find the leftmost and rightmost, topmost and bottommost pixels that are not transparent
	let x0 = img.width;
	let y0 = img.height;
	let x1 = 0;
	let y1 = 0;

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] !== 0) {
			const idx = i / 4;
			const x = idx % img.width;
			const y = Math.floor(idx / img.width);
			if (x < x0) x0 = x;
			if (x > x1) x1 = x;
			if (y < y0) y0 = y;
			if (y > y1) y1 = y;
		}
	}

	const aspectRatio = (x1 - x0) / (y1 - y0);

	// Create a new image with the same aspect ratio, but capped at 168x168
	let newWidth = Math.min(168, Math.round(aspectRatio * 168));
	let newHeight = Math.min(168, Math.round(168 / aspectRatio));
	if (newWidth > x1 - x0) {
		newWidth = x1 - x0;
		newHeight = Math.min(168, Math.round(aspectRatio * newWidth));
	}

	const newCanvas = document.createElement("canvas");
	newCanvas.height = newWidth;
	newCanvas.width = newHeight;

	const newCtx = newCanvas.getContext("2d");
	if (!newCtx) throw new Error("Could not get context");

	newCtx.drawImage(
		img,
		x0,
		y0,
		x1 - x0,
		y1 - y0,
		5,
		5,
		newWidth - 20,
		newHeight - 10,
	);
	const blob = await new Promise<Blob>((resolve, reject) => {
		newCanvas.toBlob((blob) => {
			if (!blob) reject(new Error("Could not create blob"));
			else resolve(blob);
		}, "image/png");
	});
	UploadFile("./chibi.png", [
		...new Uint8ClampedArray(await blob.arrayBuffer()),
	]);
	modelValue.value = "./chibi.png";
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = url;
		img.onload = () => {
			resolve(img);
		};
		img.onerror = (e) => {
			reject(e);
		};
	});
}
</script>
<template>
	<p>
		<label for="chibi">Chibi</label>
		<br />
		<ImageInput id="chibi" label="Chibi" v-model="modelValue" />
		<br />
		<Button v-if="modelValue === ''" @click="selectorOpen = true"
			>Generate chibi</Button
		>
		<img
			v-else
			:src="joinNormalize(folder, modelValue)"
			style="max-height: 50vh"
		/>
		<br />
	</p>

	<FileSelectDialog
		v-if="selectorOpen"
		:folder="folder"
		:filter="/\.png|jpe?g|webp$/i"
		@selected="
			generateChibi($event[0]);
			selectorOpen = false;
		"
		@close="selectorOpen = false"
	/>
</template>
