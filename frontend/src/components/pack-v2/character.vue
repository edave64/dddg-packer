<script setup lang="ts">
import { aryRemove } from "@/array-tools";
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import ImageInput from "@/components/shared/image-input.vue";
import { joinNormalize } from "@/path-tools";
import { goUp, setTemporaryAlias } from "@/router";
import { isV2, useActivePack, useCharacter } from "@/store/active-pack";
import { useNormalizedDependecyTree } from "@/store/dependencies";
import { Confirm } from "@wails/go/main/App";
import { BrowserOpenURL } from "@wails/runtime/runtime";
import { Button } from "primevue";
import { computed } from "vue";

const char = useCharacter();
const pack = useActivePack();

const f = computed(() => {
	const charV = char.value;
	const packV = pack.value;
	if (!charV || !packV) return "";

	return joinNormalize(packV.packId!, "", charV.folder);
});

function resolve(path: string | undefined): string {
	if (!path) return "";
	const packV = pack.value;
	if (!packV) return "";

	return joinNormalize(packV.packId!, f.value, path);
}

const normalizedDependecyTree = useNormalizedDependecyTree();

const isExtension = computed(() => {
	return char.value?.id.includes(":");
});

const label = computed(() => {
	return (
		char.value?.label ??
		normalizedDependecyTree.value.characters.find(
			(x) => x.id === char.value?.id,
		)?.label
	);
});

async function deleteCharacter() {
	const packV = pack.value;
	const charV = char.value;
	if (!packV || !isV2(packV) || !packV.characters || !charV) return;
	if (
		!(await Confirm(
			`Are you sure you want to delete the character${isExtension.value ? " extension" : ""} ${label.value ?? charV.id}?`,
			"Delete character",
		))
	) {
		return;
	}
	goUp();
	aryRemove(packV.characters, charV);
}

const id = computed({
	get: () => char.value?.id ?? "",
	set: (value) => {
		const charV = char.value;
		const packV = pack.value;
		if (!charV || !packV) return;
		setTemporaryAlias("charId", charV.id, value);
		charV.id = value;
	},
});

const labelWithFallback = computed(() => {
	return (
		char.value?.label ??
		normalizedDependecyTree.value.characters.find(
			(x) => x.id === char.value?.id,
		)?.label
	);
});
</script>
<template>
	<template v-if="char">
		<h2 v-if="!isExtension">Character {{ char.label || char.id }}</h2>
		<h2 v-else>
			Character extension for {{ labelWithFallback || char.id }}
		</h2>

		<p v-if="id === 'dddg.buildin.base.natsuki:ddlc.natsuki'">
			NOTICE: DDLC sprites for Natsuki must be manually adjusted to match
			changes to the sprites made in DDDG. Otherwise, there may be gaps or
			overlaps in the sprites.
			<a
				href="https://github.com/edave64/dddg-packer/wiki/Natsuki:-Difference-between-DDDG-sprites-and-DDLC-sprites"
				target="_blank"
				@click.prevent="BrowserOpenURL($event.target!.href)"
				>Learn more</a
			>
		</p>

		<IdLabelPair
			html-id="char"
			v-model:id="id"
			v-model:label="char.label"
			delayed
			v-if="!isExtension"
		/>
		<IdLabelPair
			html-id="char-id"
			:id="char.id"
			:label="labelWithFallback"
			delayed
			disabled
			v-else
		/>
		<p v-if="!isExtension">
			<ImageInput id="char-chibi" label="Chibi" v-model="char.chibi" />
			<br />
			<img :src="resolve(char.chibi)" style="max-height: 50vh" />
		</p>
		<p>
			<Button
				id="char-delete"
				:label="'Delete character' + (isExtension ? ' extension' : '')"
				@click="deleteCharacter()"
			/>
		</p>
		<Code :obj="char" />
	</template>
</template>
