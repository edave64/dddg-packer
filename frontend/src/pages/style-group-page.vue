<script setup lang="ts">
import Code from "@/components/shared/code.vue";
import PInput from "@/components/shared/p-input.vue";
import { go, setTemporaryAlias } from "@/router";
import { useCharacter, usePackId, useStyleGroup } from "@/store/active-pack";
import { getStyleId, useNormalizedDependecyTree } from "@/store/dependencies";
import { styleGroupFolder } from "@/store/folders";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const f = styleGroupFolder;
const char = useCharacter();
const styleGroup = useStyleGroup();
const depChar = useNormalizedDependecyTree();

const depStyleGroup = computed(() => {
	const charId = char.value?.id;
	const depCharV = depChar.value.characters.find((x) => x.id === charId);
	if (!depCharV) return null;
	return depCharV.styleGroups.find((x) => x.id === styleGroup.value?.id);
});

const isExtension = computed(() => {
	return !!depStyleGroup.value;
});

const availableStylesExts = computed(() => {
	const styles = depStyleGroup.value?.styles;
	const styleGroupV = styleGroup.value;
	if (!styles || !styleGroupV) return [];
	const allStyles = styleGroupV.styles.map((x) => getStyleId(x.components));
	return styles.filter((x) => !allStyles.includes(x.id));
});

async function deleteThis() {
	const charV = char.value;
	if (!charV) return;
	if (
		await Confirm(
			"Do you really want to delete this style group? This cannot be undone.",
			"Deleting style group",
		)
	) {
		charV.styleGroups = charV.styleGroups?.filter(
			(x) => x.id !== styleGroup.value?.id,
		);
		go("character", {
			packId: usePackId().value!,
			charId: charV.id,
		});
	}
}

const id = computed({
	get() {
		return styleGroup.value?.id;
	},
	set(value: string) {
		const styleGroupV = styleGroup.value;
		const charV = char.value;
		if (!styleGroupV || !charV) return;

		setTemporaryAlias("styleGroupId", styleGroupV.id, value);
		styleGroupV.id = value;
	},
});
</script>
<template>
	<template v-if="styleGroup">
		<h2>Style group {{ isExtension ? "extension" : "" }}</h2>
		<p>
			<PInput
				id="style-group-id"
				label="ID"
				v-model="id"
				type="id"
				:disabled="isExtension"
				delayed
			/>
		</p>
		<Button @click="deleteThis"
			>Delete style group {{ isExtension ? "extension" : "" }}</Button
		>
		<Code :obj="styleGroup" />
	</template>
</template>
