<script setup lang="ts">
import { ref, type PropType } from "vue";
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

function addVariant(newVariant: string) {
	props.variants.push([newVariant]);
	selectedVariant.value = props.variants.length - 1;
	console.log(selectedVariant.value);
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
				<fast-select
					size="5"
					id="sprite_variants"
					:selectedIndex="selectedVariant"
					@input="selectedVariant = $event.target.selectedIndex"
				>
					<fast-option v-for="(variant, i) of variants" :value="i">
						{{ variant.length === 1 ? variant[0] : variant }}
					</fast-option>
				</fast-select>
				<fast-button @click="quickAddOpen = true">Add variation</fast-button>
				<fast-button
					:disabled="selectedVariant === -1"
					@click="
						variants.splice(selectedVariant, 1);
						selectedVariant = 0;
					"
					>Remove variation</fast-button
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
			@selected="
				addVariant($event);
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
