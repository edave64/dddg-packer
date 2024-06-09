<script setup lang="ts">
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, ref, type PropType } from "vue";
import FileSelectDialog from "../shared/file-select-dialog.vue";
import PInput from "../shared/p-input.vue";
import ImageCollection from "./image-collection.vue";

const props = defineProps({
	variants: {
		required: true,
		type: Array as PropType<string[][]>,
	},
	folder: {
		type: String,
		required: true,
	},
	labelEditable: {
		type: Boolean,
		default: false,
	},
});

const label = defineModel("label", {
	required: false,
	type: String,
});

const quickAddOpen = ref(false);

const selectedVariant = ref(props.variants.length > 0 ? 0 : -1);

const variantsWithIdx = computed(() =>
	props.variants.map((x, i) => ({ idx: i, variant: x })),
);

function addVariants(newVariants: string[]) {
	props.variants.push(...newVariants.map((x) => [x]));
	selectedVariant.value = props.variants.length - 1;
}
</script>
<template>
	<fieldset>
		<legend>
			<template v-if="!labelEditable">{{ label }}</template>
			<PInput v-else v-model="label" label="" />
		</legend>
		<div class="variant_splitter">
			<div v-if="variants">
				<label for="sprite_variants">Variants:</label>
				<Listbox
					v-model="selectedVariant"
					:options="variantsWithIdx"
					optionValue="idx"
					:optionLabel="
						(x) => (x.variant.length === 1 ? x.variant[0] : x.variant)
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
					v-if="selectedVariant !== -1"
					:imageCollection="variants[selectedVariant]"
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
