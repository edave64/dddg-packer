<script setup lang="ts">
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, ref, type PropType } from "vue";
import FileSelectDialog from "../shared/file-select-dialog.vue";
import ImageCollection from "./image-collection.vue";

const props = defineProps({
	variants: {
		required: true,
		type: Array as PropType<(string | NsfwAbleImg)[]>,
	},
	label: {
		required: true,
		type: String,
	},
	folder: {
		type: String,
		required: true,
	},
});

const quickAddOpen = ref(false);
const selectedVariant = ref(props.variants.length > 0 ? 0 : -1);

function addVariants(newVariant: string[]) {
	props.variants.push(...newVariant);
	selectedVariant.value = props.variants.length - 1;
	console.log(selectedVariant.value);
}

const variantsWithIdx = computed(() =>
	props.variants.map((x, i) => ({ idx: i, variant: x })),
);
</script>
<template>
	<fieldset>
		<legend>{{ label }}</legend>
		<div class="variant_splitter">
			<div>
				<label for="sprite_variants">Variants:</label>
				<Listbox
					v-model="selectedVariant"
					:options="variantsWithIdx"
					optionValue="idx"
					:optionLabel="
						(x) => (typeof x.variant === 'string' ? x.variant : x.variant.img)
					"
					listStyle="max-height:256px"
				/>
				<Button @click="quickAddOpen = true">Add variation</Button>
				<Button
					:disabled="selectedVariant === -1"
					@click="
						variants.splice(selectedVariant, 1);
						selectedVariant = 0;
					"
					>Remove variation</Button
				>
			</div>
			<div class="grower">
				<ImageCollection
					style="height: 100%"
					v-if="selectedVariant !== -1"
					v-model="variants[selectedVariant]"
					:folder="folder"
				/>
			</div>
		</div>
		<file-select-dialog
			v-if="quickAddOpen"
			:folder="folder"
			:filter="/\.png|jpe?g|webp$/i"
			multiple
			@selected="
				addVariants($event);
				quickAddOpen = false;
			"
			@close="quickAddOpen = false"
		/>
	</fieldset>
</template>

<style scoped>
fast-select {
	width: 256px;
	display: block;
}

.grower {
	flex-grow: 1;
}

.variant_splitter {
	display: flex;
}
</style>
