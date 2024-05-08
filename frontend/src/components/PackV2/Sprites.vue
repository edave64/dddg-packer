<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONSprite } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./image-collection.vue";
import Variations from "./variations.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	sprite: {
		required: true,
		type: Object as PropType<JSONSprite>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const f = computed(() => {
	return joinNormalize(props.folder, props.sprite.folder);
});
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
	<ImageCollection
		v-if="sprite.variants?.length === 1"
		:imageCollection="sprite.variants[0]"
		:folder="f"
	/>
	<Variations :variants="sprite.variants" label="Variants" :folder="f" v-else />
	<Code :obj="sprite" />
</template>
