<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { type JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./ImageCollection.vue";
import Code from "../shared/code.vue";

const props = defineProps({
	sprite: {
		required: true,
		type: Object as PropType<JSONSprite>,
	},
});

const emit = defineEmits<{}>();
const selectedVariant = ref(props.sprite.variants.length > 0 ? 0 : -1);
</script>
<template>
	<h2>Sprite</h2>
	<p>
		<label for="sprite_id">ID: </label>
		<input id="sprite_id" v-model="sprite.id" />
	</p>
	<p>
		<label for="sprite_id">Label: </label>
		<input id="sprite_id" v-model="sprite.label" />
	</p>
	<p v-if="sprite.variants.length > 0">
		<label from="sprite_variants">Variants:</label>
		<select
			id="sprite_variants"
			@change="selectedVariant = +($event.target as HTMLSelectElement).value"
		>
			<option
				v-for="(variant, i) of sprite.variants"
				:value="i"
				:selected="i === selectedVariant"
			>
				{{ variant }}
			</option>
		</select>
	</p>
	<ImageCollection
		v-if="selectedVariant !== -1"
		:imageCollection="sprite.variants[selectedVariant]"
	/>
	<Code :obj="sprite" />
</template>
