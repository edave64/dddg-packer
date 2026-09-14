<script setup lang="ts">
import { aryFindRemove, aryRemove } from "@/array-tools";
import Code from "@/components/shared/code.vue";
import IdLabelPair from "@/components/shared/id-label-pair.vue";
import { setTemporaryAlias, useParams } from "@/router";
import { useCharacterV1, useStyleV1 } from "@/store/active-pack";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed } from "vue";

const style = useStyleV1();
const params = useParams();

const id = computed({
	get(): string {
		return style.value?.name ?? "";
	},
	set(val: string) {
		const charV = useCharacterV1().value;
		const styleV = useStyleV1().value;
		if (!charV || !styleV) return;

		setTemporaryAlias("styleId", styleV.name, val);
		styleV.name = val;

		if (charV.poses) {
			for (const pose of charV.poses) {
				if (pose.style === styleV.name) {
					pose.style = val;
				}
			}
		}
	},
});

async function deleteThis() {
	const charV = useCharacterV1().value;
	const styleV = useStyleV1().value;
	if (!charV || !styleV) return;

	const hasPoses = charV.poses?.find((x) => x.style === styleV.name) ?? false;
	if (
		await Confirm(
			`Do you really want to delete this style? This cannot be undone.${hasPoses ? " All associated poses will be deleted, too" : ""}`,
			"Deleting style",
		)
	) {
		aryFindRemove(charV.styles, (x) => x.name === styleV.name);

		if (hasPoses && charV.poses) {
			for (const pose of charV.poses) {
				if (pose.style === styleV.name) {
					aryRemove(charV.poses, pose);
				}
			}
		}
	}
}
</script>
<template>
	<template v-if="style">
		<h2>Style</h2>
		<IdLabelPair
			html-id="style-id"
			v-model:id="id"
			v-model:label="style.label"
		/>
		<Button @click="deleteThis">Delete Style</Button>
		<Code :obj="style" />
	</template>
</template>
