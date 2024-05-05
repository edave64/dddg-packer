<script setup lang="ts">
import { computed, ref, watch, type PropType } from "vue";
import { type JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./ImageCollection.vue";
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

const emit = defineEmits<{}>();
const selectedVariant = ref(props.variants.length > 0 ? 0 : -1);
</script>
<template>
	<fieldset>
		<legend>{{ label }}</legend>
		<p v-if="variants.length > 0">
			<label from="sprite_variants">Variants:</label>
			<select
				id="sprite_variants"
				@change="selectedVariant = +($event.target as HTMLSelectElement).value"
			>
				<option
					v-for="(variant, i) of variants"
					:value="i"
					:selected="i === selectedVariant"
				>
					{{ variant }}
				</option>
			</select>
		</p>
		<ImageCollection
			v-if="selectedVariant !== -1"
			:imageCollection="variants[selectedVariant]"
			:folder="folder"
		/>
	</fieldset>
</template>
