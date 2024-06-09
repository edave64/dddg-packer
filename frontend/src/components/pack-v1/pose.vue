<script setup lang="ts">
import type { JSONPoseMeta } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import ToggleBox from "../shared/toggle-box.vue";
import type { HeadDummy } from "./headDummy";
import ImageCollection from "./image-collection.vue";
import Variations from "./variations.vue";

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
	delete: [];
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

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this pose? This cannot be undone.",
			"Deleting pose",
		)
	) {
		emit("delete");
	}
}

const selectedHeadGroups = computed({
	get() {
		return props.pose.compatibleHeads ?? [];
	},
	set(value: string[]) {
		if (value.length === 0) {
			if (props.pose.compatibleHeads) {
				delete props.pose.compatibleHeads;
			}
		} else {
			props.pose.compatibleHeads = value;
		}
	},
});
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
		<Listbox multiple v-model="selectedHeadGroups" :options="headGroups" />
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
		title="Static"
		:folder="f"
		v-model="pose.static"
	/>
	<template v-if="!('left' in pose || 'variant' in pose || 'static' in pose)">
		<Button
			@click="
				(pose as any).left = [];
				(pose as any).right = [];
			"
			>Initialize as split-pose</Button
		>
		<br />
		<Button @click="(pose as any).variant = []">Initialize as variants</Button>
		<br />
		<Button @click="(pose as any).static = ''">Initialize as static</Button>
		<br />
	</template>
	<Button @click="deleteThis">Delete Pose</Button>
	<Code :obj="pose" />
</template>
