<script setup lang="ts">
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";
import Button from "primevue/button";
import { ref, type PropType } from "vue";
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
</script>
<template>
	<fieldset>
		<legend>{{ label }}</legend>
		<div class="variant_splitter">
			<div>
				<label for="sprite_variants">Variants:</label>
				<fast-select
					size="5"
					id="sprite_variants"
					@input="selectedVariant = $event.target.selectedIndex"
				>
					<fast-option
						v-for="(variant, i) of variants"
						:value="i"
						:selected="i === selectedVariant"
					>
						{{ typeof variant === "string" ? variant : variant.img }}
					</fast-option>
				</fast-select>
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
