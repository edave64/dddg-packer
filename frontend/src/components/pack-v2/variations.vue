<script setup lang="ts">
import { computed, ref, watch, type PropType } from "vue";
import type { JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./image-collection.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "@/path-tools";

const props = defineProps({
	variants: {
		required: true,
		type: Array as PropType<string[][]>,
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

const selectedVariant = ref(props.variants.length > 0 ? 0 : -1);
</script>
<template>
	<fieldset>
		<legend>{{ label }}</legend>
		<div class="variant_splitter">
			<div v-if="variants.length > 0">
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
						@select="console.log($event)"
						@input="console.log($event)"
						@change="console.log($event)"
					>
						{{ variant.length === 1 ? variant[0] : variant }}
					</fast-option>
				</fast-select>
			</div>
			<div class="grower">
				<ImageCollection
					v-if="selectedVariant !== -1"
					:imageCollection="variants[selectedVariant]"
					:folder="folder"
				/>
			</div>
		</div>
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
