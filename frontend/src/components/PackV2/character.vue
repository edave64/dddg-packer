<script setup lang="ts">
import { computed, type PropType } from "vue";
import { type JSONCharacter } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import ImageCollection from "./ImageCollection.vue";
import Variations from "./variations.vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";

const props = defineProps({
	char: {
		required: true,
		type: Object as PropType<JSONCharacter>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.char.folder);
});
</script>
<template>
	<h2>Character</h2>
	<p>
		<label for="sprite_id">ID: </label>
		<input id="sprite_id" v-model="char.id" />
	</p>
	<p>
		<label for="sprite_id">Label: </label>
		<input id="sprite_id" v-model="char.label" />
	</p>
	<p>
		<label for="char_chibi">Chibi: </label>
		<input id="char_chibi" v-model="char.chibi" />
		<br />
		<img :src="joinNormalize(f, char.chibi)" />
	</p>
	<Code :obj="char" />
</template>
