<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type {
	JSONHeadCollections,
	JSONPose,
	JSONStyle,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
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
			</fast-tree-item>
		</teleport>
		<h2>Style</h2>
		<p></p>
		<Code :obj="style" />
	</template>
	<Pose
		:pose="state.obj"
		:folder="folder"
		@leave="state = null"
		:head-groups="headGroups"
		v-else-if="state.t === 'pose'"
	/>
</template>
