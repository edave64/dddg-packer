<script setup lang="ts">
import { aryFindRemove } from "@/array-tools";
import ImageCollection from "@/components/pack-v1/image-collection.vue";
import Variations from "@/components/pack-v1/variations.vue";
import Code from "@/components/shared/code.vue";
import ComboBox, { type IOptions } from "@/components/shared/combo-box.vue";
import { deletableField } from "@/components/shared/deletable-field";
import PInput from "@/components/shared/p-input.vue";
import ToggleBox from "@/components/shared/toggle-box.vue";
import { useCharacterV1, usePoseV1 } from "@/store/active-pack";
import { useNormalizedDependecyTree } from "@/store/dependencies";
import { poseFolder } from "@/store/folders";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed } from "vue";

const f = poseFolder;
const pose = usePoseV1();

const charV1 = useCharacterV1();
const headGroups = computed(() =>
	charV1.value?.heads ? Object.keys(charV1.value.heads) : [],
);

const headInForeground = deletableField(
	() => pose.value!,
	"headInForeground",
	false,
);
const selectedHeadGroups = deletableField(
	() => pose.value!,
	"compatibleHeads",
	[],
);

const styles = computed<IOptions[]>(() => {
	const ret: IOptions[] = [];
	const charV1 = useCharacterV1().value;
	if (!charV1) return ret;
	const stylesEncountered = new Set<string>();
	for (const style of charV1.styles ?? []) {
		ret.push({ label: style.label, value: style.name });
		stylesEncountered.add(style.name);
	}
	for (const pose of charV1.poses ?? []) {
		if (stylesEncountered.has(pose.style)) continue;

		ret.push({ label: pose.style, value: pose.style });
		stylesEncountered.add(pose.style);
	}
	const depChar = useNormalizedDependecyTree().value?.characters?.find(
		(x) => x.id === charV1.id,
	);
	if (depChar) {
		for (const style of depChar.styleGroups ?? []) {
			if (stylesEncountered.has(style.id)) continue;

			ret.push({ label: style.label, value: style.id });
			stylesEncountered.add(style.id);
		}
	}
	return ret;
});

async function deleteThis() {
	const charV1 = useCharacterV1().value;
	const poseId = pose.value?.name;
	if (!charV1 || poseId == null) return;

	if (
		await Confirm(
			"Do you really want to delete this pose? This cannot be undone.",
			"Deleting pose",
		)
	) {
		aryFindRemove(charV1.poses, (p) => p.name === poseId);
	}
}
</script>
<template>
	<template v-if="pose">
		<h2>Pose</h2>
		<PInput id="pose-id" label="ID" v-model="pose.name" />
		<ComboBox
			id="pose-style"
			editable
			v-model="pose.style"
			label="Style"
			:data="styles"
		/>
		<toggle-box
			id="pose-hif"
			label="Head in foreground?"
			v-model="headInForeground"
		/>
		<details v-if="headGroups.length > 0">
			<summary>Head groups</summary>
			<Listbox
				multiple
				v-model="selectedHeadGroups"
				:options="headGroups"
			/>
		</details>
		<template v-if="'left' in pose">
			<Variations
				id="pose-left-variants"
				label="Left"
				:folder="f"
				:variants="pose.left"
			/>
			<Variations
				id="pose-right-variants"
				label="Right"
				:folder="f"
				:variants="pose.right"
			/>
		</template>
		<Variations
			id="pose-variant-variants"
			v-if="'variant' in pose"
			label="Variants"
			:folder="f"
			:variants="pose.variant"
		/>
		<ImageCollection
			id="pose-static"
			v-if="'static' in pose"
			title="Static"
			:folder="f"
			v-model="pose.static"
		/>
		<template
			v-if="!('left' in pose || 'variant' in pose || 'static' in pose)"
		>
			<Button
				@click="
					(pose as any).left = [];
					(pose as any).right = [];
				"
				>Initialize as split-pose</Button
			>
			<br />
			<Button @click="(pose as any).variant = []"
				>Initialize as variants</Button
			>
			<br />
			<Button @click="(pose as any).static = ''"
				>Initialize as static</Button
			>
			<br />
		</template>
		<Button @click="deleteThis">Delete Pose</Button>
		<Code :obj="pose" />
	</template>
</template>
