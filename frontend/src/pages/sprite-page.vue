<script setup lang="ts">
import { aryRemove } from "@/array-tools";
import ImageCollection from "@/components/pack-v2/image-collection.vue";
import Variations from "@/components/pack-v2/variations.vue";
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import { goUp, setTemporaryAlias } from "@/router";
import { isV2, useActivePack, useSprite } from "@/store/active-pack";
import { spriteFolder } from "@/store/folders";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const f = spriteFolder;
const sprite = useSprite();

const id = computed({
	get: () => sprite.value?.id ?? "",
	set: (value) => {
		const spriteV = sprite.value;
		const oldValue = id.value;
		if (!spriteV) return;

		setTemporaryAlias("spriteId", oldValue, value);
		spriteV.id = value;
	},
});

async function deleteThis() {
	const packV = useActivePack().value;
	const spriteV = sprite.value;
	if (!packV || !isV2(packV) || !spriteV) return;

	if (
		await Confirm(
			"Do you really want to delete this sprite? This cannot be undone.",
			"Deleting sprite",
		)
	) {
		aryRemove(packV.sprites, spriteV);
		goUp();
	}
}
</script>
<template>
	<template v-if="sprite">
		<h2>Sprite</h2>
		<IdLabelPair
			html-id="sprite-id"
			v-model:id="id"
			v-model:label="sprite.label"
		/>
		<ImageCollection
			id="sprite-image-collection"
			v-if="sprite.variants?.length === 1"
			:imageCollection="sprite.variants[0]"
			:folder="f"
		/>
		<Variations
			id="sprite-variants"
			:variants="sprite.variants"
			label="Variants"
			:folder="f"
			v-else
		/>
		<Button @click="deleteThis">Delete sprite</Button>
		<Code :obj="sprite" />
	</template>
</template>
