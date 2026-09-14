<script setup lang="ts">
import { aryFindRemove } from "@/array-tools";
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import { goUp } from "@/router";
import { isV2, useActivePack, useCharacter } from "@/store/active-pack";
import { useNormalizedDependecyTree } from "@/store/dependencies";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const char = useCharacter();
const depChar = computed(() => {
	return useNormalizedDependecyTree().value.characters.find(
		(c) => c.id === char.value?.id,
	);
});

function deleteThis() {
	const packV = useActivePack().value;
	if (!packV || !isV2(packV) || !packV.characters) return;
	const charId = char.value?.id;
	if (!charId) return;
	// TODO: Why is there no confirm dialog here???,

	if (
		!Confirm(
			"Are you sure you want to delete this character extension?",
			"Deleting character extension",
		)
	)
		return;

	aryFindRemove(packV.characters, (c) => c.id === charId);
	goUp();
}
</script>
<template>
	<template v-if="char">
		<h2>Character extension</h2>
		<IdLabelPair
			htmlId="char-id"
			:id="char.id"
			:label="char.label ?? depChar?.label"
			disabled
		/>
		<Button id="char-delete" @click="deleteThis"
			>Delete character extension</Button
		>
		<Code :obj="char" />
	</template>
</template>
