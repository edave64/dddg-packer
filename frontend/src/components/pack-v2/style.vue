<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import type {
	JSONHeadCollections,
	JSONPose,
	JSONStyle,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { computed, ref, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import Pose from "./pose.vue";

const props = defineProps({
	style: {
		required: true,
		type: Object as PropType<JSONStyle>,
	},
	headGroups: {
		required: true,
		type: Object as PropType<JSONHeadCollections>,
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
	return joinNormalize(props.folder, props.style.folder);
});

const state = ref(null as State);

type State = null | {
	t: "pose";
	obj: JSONPose;
};

function createPose() {
	const id = seekFreeIds(
		"pose",
		// don't filter by style, since all poses can collide name, even in different styles
		props.style.poses.map((x) => x.id),
	);
	if (!props.style.poses) {
		props.style.poses = [];
	}
	const obj: JSONPose = {
		id,
	};
	props.style.poses.push(obj);
	state.value = {
		t: "pose",
		obj,
	};
}

function deleteObj() {
	const s = state.value;
	if (s === null) return;
	state.value = null;
	switch (s.t) {
		case "pose": {
			const idx = props.style.poses.findIndex((x) => x.id === s.obj.id);
			props.style.poses.splice(idx, 1);
			break;
		}
	}
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item :href="state ? '#' : ''" @click="state = null"
			>Style</fast-breadcrumb-item
		>
	</teleport>
	<template v-if="state === null">
		<teleport to="#tree">
			<fast-tree-item @click="$emit('leave')"
				>Back to style group</fast-tree-item
			>
			<fast-tree-item expanded>
				Poses
				<fast-tree-item
					v-for="pose of style.poses"
					:key="'p:' + pose.id"
					expanded
					@click="state = { t: 'pose', obj: pose }"
				>
					{{ pose.id }}
				</fast-tree-item>
				<fast-tree-item @click="createPose">Create pose</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style</h2>
		<Code :obj="style" />
	</template>
	<Pose
		:pose="state.obj"
		:folder="folder"
		:head-groups="headGroups"
		@leave="state = null"
		@delete="deleteObj"
		v-else-if="state.t === 'pose'"
	/>
</template>
