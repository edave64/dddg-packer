<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import { normalizeId } from "@/id-tools";
import type {
	JSONCharacter,
	JSONPoseMeta,
	JSONStyle,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, ref, watch, type PropType } from "vue";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import type { HeadDummy } from "./headDummy";
import Pose from "./pose.vue";

const props = defineProps({
	styleObj: {
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
	delete: [];
}>();

const state = ref(null as State);

type State = null | {
	t: "pose";
	obj: JSONPoseMeta<HeadDummy>;
};

const id = computed({
	get(): string {
		return props.styleObj.name;
	},
	set(val: string) {
		const oldVal = props.styleObj.name;
		if (oldVal === val) return;

		if (props.char.poses) {
			for (const pose of props.char.poses) {
				if (pose.style === oldVal) {
					pose.style = val;
				}
			}
		}
		props.styleObj.name = val;
	},
});

async function deleteThis() {
	const hasPoses =
		props.char.poses?.find((x) => x.style === props.styleObj.name) ?? false;
	if (
		await Confirm(
			`Do you really want to delete this style? This cannot be undone.${hasPoses ? " All associated poses will be deleted, too" : ""}`,
			"Deleting style",
		)
	) {
		emit("delete");
	}
}

function deleteObj() {
	const s = state.value;
	if (s === null) return;
	state.value = null;
	switch (s.t) {
		case "pose": {
			if (!props.char.poses) break;
			const idx = props.char.poses.findIndex((x) => x.name === s.obj.name);
			props.char.poses.splice(idx, 1);
			if (props.char.poses.length === 0) {
				delete props.char.poses;
			}
			break;
		}
	}
}

function createPose() {
	const id = seekFreeIds(
		"pose",
		// don't filter by style, since all poses can collide name, even in different styles
		props.char.poses?.map((x) => x.name),
	);
	if (!props.char.poses) {
		props.char.poses = [];
	}
	const obj = {
		name: id,
		style: props.styleObj.name,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} as any;
	props.char.poses.push(obj);
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
					v-for="pose of char.poses?.filter((x) => x.style === styleObj.name)"
					:key="'p:' + pose.name"
					expanded
					@click="state = { t: 'pose', obj: pose }"
				>
					{{ pose.name }}
				</fast-tree-item>
				<fast-tree-item @click="createPose">Add pose</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style</h2>
		<PInput label="Label" v-model="styleObj.label" />
		<PInput label="Id" v-model="id" />
		<Button @click="deleteThis">Delete Style</Button>
		<Code :obj="styleObj" />
	</template>
	<Pose
		:pose="state.obj"
		:folder="folder"
		:head-groups="Object.keys(char.heads ?? {})"
		@leave="state = null"
		@delete="deleteObj"
		v-else-if="state.t === 'pose'"
	/>
</template>
