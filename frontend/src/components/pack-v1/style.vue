<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type {
	JSONCharacter,
	JSONHeadCollection,
	JSONPoseMeta,
	JSONStyle,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import Code from "../shared/code.vue";
import Pose from "./pose.vue";
import PInput from "../shared/p-input.vue";

const props = defineProps({
	style: {
		required: true,
		type: Object as PropType<JSONStyle>,
	},
	char: {
		required: true,
		type: Object as PropType<JSONCharacter<HeadDummy>>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	leave: [];
}>();

const state = ref(null as State);
type HeadDummy = Record<string, JSONHeadCollection>;

type State = null | {
	t: "pose";
	obj: JSONPoseMeta<HeadDummy>;
};

const id = computed({
	get(): string {
		return props.style.name;
	},
	set(val: string) {
		const oldVal = props.style.name;
		if (oldVal === val) return;

		if (props.char.poses) {
			for (const pose of props.char.poses) {
				if (pose.style === oldVal) {
					pose.style = val;
				}
			}
		}
		props.style.name = val;
	},
});
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
					v-for="pose of char.poses?.filter((x) => x.style === style.name)"
					:key="'p:' + pose.name"
					expanded
					@click="state = { t: 'pose', obj: pose }"
				>
					{{ pose.name }}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style</h2>
		<PInput label="Id" v-model="id" />
		<PInput label="Label" v-model="style.label" />
		<Code :obj="style" />
	</template>
	<Pose
		:pose="state.obj"
		:folder="folder"
		@leave="state = null"
		v-else-if="state.t === 'pose'"
	/>
</template>
