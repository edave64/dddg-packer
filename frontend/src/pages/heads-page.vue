<script setup lang="ts">
import VariationsV1 from "@/components/pack-v1/variations.vue";
import Variations from "@/components/pack-v2/variations.vue";
import Code from "@/components/shared/code.vue";
import PInput from "@/components/shared/p-input.vue";
import { goUp, setTemporaryAlias, useParams } from "@/router";
import {
	useCharacter,
	useCharacterV1,
	useHeadGroup,
	useHeadGroupV1,
} from "@/store/active-pack";
import { useNormalizedDependecyTree } from "@/store/dependencies";
import { headGroupFolder } from "@/store/folders";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const char = computed(() => {
	return useCharacter().value || useCharacterV1().value;
});

async function deleteThis() {
	const charV = char.value;
	const idV = id.value;
	if (!charV || !charV.heads || idV == null) return;
	if (
		!(await Confirm(
			"Do you really want to delete this head group? This cannot be undone.",
			"Deleting head group",
		))
	)
		return;
	delete charV.heads[idV];

	// TODO: Remove the head group from poses (If it wasn't an extension)
	goUp();
}

const headGroup = useHeadGroup();
const headGroupV1 = useHeadGroupV1();
const f = headGroupFolder;

const isExtension = computed(() => {
	const depChar = useNormalizedDependecyTree().value;
	const idV = id.value;
	const charV = char.value;
	if (!depChar || idV == null) return false;
	return !!depChar.characters
		.find((x) => x.id === charV?.id)
		?.headGroups.find((x) => x.id === idV);
});

const params = useParams();
const id = computed({
	get() {
		return params.value.headGroupId as string;
	},
	set(value: string) {
		const old = params.value.headGroupId as string;
		const charV2 = useCharacter().value;
		const charV1 = useCharacterV1().value;
		const char = charV2 || charV1;
		if (!char || !char.heads) return;

		char.heads[value] = char.heads[old];
		setTemporaryAlias("headGroupId", old, value);
		let poses: Array<{ compatibleHeads?: string[] }> | undefined =
			undefined;
		// Propagate changed head name to head lists of poses
		if (charV1) {
			poses = charV1.poses;
		} else if (charV2) {
			poses = charV2.styleGroups?.flatMap((sg) =>
				sg.styles?.flatMap((s) => s.poses),
			);
		}
		if (poses) {
			for (const pose of poses) {
				const compatibleHeads = pose.compatibleHeads;
				if (!compatibleHeads) continue;
				const headIdx = compatibleHeads.indexOf(old);
				if (headIdx !== -1) {
					compatibleHeads[headIdx] = value;
				}
			}
		}
		delete char.heads[old];
	},
});
</script>
<template>
	<template v-if="headGroup">
		<h2>Head group</h2>
		<p>
			<PInput
				id="head-group-id"
				label="ID"
				type="id"
				v-model="id"
				:disabled="isExtension"
				delayed
			/>
		</p>
		<Variations
			id="head-group-variants"
			:variants="headGroup.variants"
			label="Variants"
			:folder="f"
		/>
		<Button @click="deleteThis">Delete head group</Button>
		<Code :obj="headGroup" />
	</template>
	<template v-if="headGroupV1">
		<h2>Head group</h2>
		<p>
			<PInput
				id="head-group-id"
				label="ID"
				type="id"
				:modelValue="id"
				:disabled="isExtension"
				delayed
			/>
		</p>
		<VariationsV1
			id="head-group-variants"
			:variants="headGroupV1.all"
			label="Variants"
			:folder="f"
		/>
		<Button @click="deleteThis">Delete head group</Button>
		<Code :obj="headGroup" />
	</template>
</template>
