<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import { seekById } from "@/id-tools";
import type {
	INormalizedCharacter,
	INormalizedPose,
	INormalizedStyle,
} from "@/normalized-dependencies";
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
	styleObj: {
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
	depChar: {
		type: Object as PropType<INormalizedCharacter>,
	},
	depStyle: {
		type: Object as PropType<INormalizedStyle>,
	},
});

const emit = defineEmits<{
	leave: [];
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.styleObj.folder);
});

const state = ref(null as State);

type State = null | {
	t: "pose";
	obj: JSONPose;
};

const isExtension = computed(() => {
	return !!props.depStyle;
});

function createPose() {
	const id = seekFreeIds(
		"pose",
		// don't filter by style, since all poses can collide name, even in different styles
		props.styleObj.poses.map((x) => x.id),
	);
	if (!props.styleObj.poses) {
		props.styleObj.poses = [];
	}
	const obj: JSONPose = {
		id,
	};
	props.styleObj.poses.push(obj);
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
			const idx = props.styleObj.poses.findIndex((x) => x.id === s.obj.id);
			props.styleObj.poses.splice(idx, 1);
			break;
		}
	}
}

const availablePoses = computed(() => {
	const poses = props.depStyle?.poses ?? [];
	return poses.filter(
		(x) => !props.styleObj.poses.map((y) => y.id).includes(x.id),
	);
});

function extendPose(pose: INormalizedPose) {
	if (!props.styleObj.poses) {
		props.styleObj.poses = [];
	}
	const obj: JSONPose = {
		id: pose.id,
	};
	props.styleObj.poses.push(obj);
	state.value = {
		t: "pose",
		obj,
	};
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
					v-for="pose of styleObj.poses"
					:key="'p:' + pose.id"
					expanded
					@click="state = { t: 'pose', obj: pose }"
				>
					{{ pose.id }}
				</fast-tree-item>
				<fast-tree-item @click="createPose">Create pose</fast-tree-item>
				<fast-tree-item
					v-for="pose of availablePoses"
					:key="'p:' + pose.id"
					expanded
					@click="extendPose(pose)"
				>
					Extend
					{{ pose.label }}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style {{ isExtension ? "extension" : "" }}</h2>
		<Code :obj="styleObj" />
	</template>
	<Pose
		:pose="state.obj"
		:folder="folder"
		:head-groups="headGroups"
		:depChar="depChar"
		:depPose="seekById(state!.obj.id, depStyle?.poses)"
		@leave="state = null"
		@delete="deleteObj"
		v-else-if="state.t === 'pose'"
	/>
</template>
