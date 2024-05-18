<script setup lang="ts">
import { computed, type PropType } from "vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import Variations from "./variations.vue";
import PInput from "../shared/p-input.vue";
import ToggleBox from "../shared/toggle-box.vue";
import type {
	JSONHeadCollection,
	JSONPoseMeta,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import ImageCollection from "./image-collection.vue";
import type { Select } from "@microsoft/fast-components";
import type { PoseMeta } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";

type HeadDummy = Record<string, JSONHeadCollection>;
const props = defineProps({
	pose: {
		required: true,
		type: Object as PropType<JSONPoseMeta<HeadDummy>>,
	},
	headGroups: {
		required: true,
		type: Array as PropType<string[]>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	leave: [];
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.pose.folder);
});

const headInForeground = computed({
	get(): boolean {
		return props.pose.headInForeground ?? false;
	},
	set(val: boolean) {
		if (
			val === props.pose.headInForeground ||
			(!val && !props.pose.headInForeground)
		)
			return;
		if (val) {
			props.pose.headInForeground = true;
		} else {
			delete props.pose.headInForeground;
		}
	},
});

function updateCompatibleHeads(event: CustomEvent) {
	const newVals = new Set(
		(event.target as Select).selectedOptions.map((x) => x.value)
	);

	if (newVals.size === 0) {
		delete props.pose.compatibleHeads;
	}
	props.pose.compatibleHeads = Array.from(newVals);
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item>{{ pose.name }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to style</fast-tree-item>
	</teleport>
	<h2>Pose</h2>
	<PInput label="ID" v-model="pose.name" />
	<toggle-box label="Head in foreground?" v-model="headInForeground" />
	<details v-if="headGroups.length > 0">
		<summary>Head groups</summary>
		<fast-select multiple @input="updateCompatibleHeads">
			<fast-option
				v-for="key of headGroups"
				:value="key"
				:selected="pose.compatibleHeads?.includes(key as string)"
				:key="`hg:${key}`"
			>
				{{ key }}
			</fast-option>
		</fast-select>
	</details>
	<template v-if="'left' in pose">
		<Variations label="Left" :folder="f" :variants="pose.left" />
		<Variations label="Right" :folder="f" :variants="pose.right" />
	</template>
	<Variations
		v-if="'variant' in pose"
		label="Variants"
		:folder="f"
		:variants="pose.variant"
	/>
	<ImageCollection
		v-if="'static' in pose"
		label="Static"
		:folder="f"
		v-model="pose.static"
	/>
	<template v-if="!('left' in pose || 'variant' in pose || 'static' in pose)">
		<fast-button
			@click="
				pose.left = [];
				pose.right = [];
			"
			>Initialize as split-pose</fast-button
		>
		<fast-button @click="pose.variant = []">Initialize as variants</fast-button>
		<fast-button @click="pose.static = ''">Initialize as static</fast-button>
	</template>
	<Code :obj="pose" />
</template>
