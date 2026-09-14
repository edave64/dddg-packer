<script setup lang="ts">
import { aryRemove } from "@/array-tools";
import Variations from "@/components/pack-v2/variations.vue";
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import { goUp, setTemporaryAlias } from "@/router";
import { isV2, useActivePack, useBackground } from "@/store/active-pack";
import { backgroundFolder } from "@/store/folders";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const background = useBackground();
const f = backgroundFolder;

async function deleteThis() {
	const packV = useActivePack().value;
	const backgroundV = useBackground().value;

	if (!packV || !backgroundV || !isV2(packV)) return;

	if (
		await Confirm(
			"Do you really want to delete this background? This cannot be undone.",
			"Deleting background",
		)
	) {
		goUp();
		aryRemove(packV.backgrounds, backgroundV);
	}
}

const id = computed({
	get(): string {
		return background.value?.id ?? "";
	},
	set(value: string) {
		const oldValue = id.value;
		const backgroundV = background.value;
		if (!backgroundV) return;
		setTemporaryAlias("backgroundId", oldValue, value);
		backgroundV.id = value;
	},
});
</script>
<template>
	<template v-if="background">
		<h2>Background</h2>
		<IdLabelPair
			html-id="background-id"
			v-model:id="id"
			v-model:label="background.label"
		/>
		<Variations
			id="background-variants"
			:variants="background.variants"
			label="Variants"
			:folder="f"
		/>
		<Button @click="deleteThis">Delete background</Button>
		<Code :obj="background" />
	</template>
</template>
