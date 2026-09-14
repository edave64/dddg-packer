<script setup lang="ts">
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import ImageInput from "@/components/shared/image-input.vue";
import { joinNormalize } from "@/path-tools";
import { useCharacterV1 } from "@/store/active-pack";
import { computed } from "vue";

const char = useCharacterV1();

const f = computed(() => {
	const charV = char.value;
	if (!charV) return "";

	return joinNormalize(charV.packId!, "", charV.folder);
});

function resolve(path: string | undefined): string {
	if (!path) return "";
	const charV = char.value;
	if (!charV) return "";

	return joinNormalize(charV.packId!, f.value, path);
}
</script>
<template>
	<template v-if="char">
		<h2>Character {{ char.name || char.id }}</h2>
		<IdLabelPair
			htmlId="char-id"
			v-model:id="char.id"
			v-model:label="char.name"
		/>
		<p>
			<ImageInput label="Chibi" v-model="char.chibi" />
			<br />
			<img :src="resolve(char.chibi)" style="max-height: 50vh" />
		</p>
		<Code :obj="char" />
	</template>
</template>
