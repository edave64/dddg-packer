<script setup lang="ts">
import { aryMove } from "@/array-tools";
import { renameKey } from "@/obj-tools";
import type {
	JSONHeadCollections,
	JSONPose,
	JSONPoseCommand,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import PoseRenderCommand from "./pose-render-command.vue";
import Variations from "./variations.vue";

const props = defineProps({
	pose: {
		required: true,
		type: Object as PropType<JSONPose>,
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
	delete: [];
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.pose.folder);
});

const defaultParts = ["Left", "Right", "Variant"];

const renderCommandsDefaultIssue = computed(() => {
	const rcs = props.pose.renderCommands;
	if (!rcs) return "There are no render commands";
	let lastIdx = -1;
	for (let i = 0, l = rcs.length; i < l; ++i) {
		const rc = rcs[i];
		switch (rc.type) {
			case "head":
				if (i > 0)
					return "The heads are the first part in the default render commands";
				break;
			case "image":
				return "Image render commands are not available in the default render commands";
			case "pose-part": {
				const defaultIdx = defaultParts.indexOf(rc.part);
				if (defaultIdx === -1) {
					return "The render commands contain poses that are not Left, Right or Variant";
				}
				if (lastIdx > defaultIdx) {
					return "For defaults, the pose-part render commands must be in the order: Left, Right or Variant";
				}
				lastIdx = defaultIdx;
			}
		}
	}
	return "";
});

function addCustomRenderCommands() {
	const commands: JSONPoseCommand[] = [];
	if (props.pose.compatibleHeads && props.pose.compatibleHeads.length > 0) {
		commands.push({ type: "head" });
	}
	if (props.pose.positions) {
		for (const part of defaultParts) {
			if (props.pose.positions && props.pose.positions[part] != null) {
				commands.push({ type: "pose-part", part });
			}
		}
		for (const part in props.pose.positions) {
			if (!defaultParts.includes(part)) {
				commands.push({ type: "pose-part", part });
			}
		}
	}
	props.pose.renderCommands = commands;
}

function moveRcUp(index: number) {
	const rcs = props.pose.renderCommands;
	if (!rcs) return;
	aryMove(rcs, index, index - 1);
}

function moveRcDown(index: number) {
	const rcs = props.pose.renderCommands;
	if (!rcs) return;
	aryMove(rcs, index, index + 1);
}

function deleteRc(index: number) {
	const rcs = props.pose.renderCommands;
	if (!rcs) return;
	rcs.splice(index, 1);
}

function renamePosition(oldName: string, newName: string) {
	if (!props.pose.positions) return;
	const newPositions = renameKey(props.pose.positions, oldName, newName);
	if (newPositions === null) return;
	props.pose.positions = newPositions;
	if (props.pose.renderCommands) {
		for (const rc of props.pose.renderCommands) {
			if (rc.type === "pose-part" && rc.part === oldName) {
				rc.part = newName;
			}
		}
	}
}

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

const headGroupOptions = computed((): Array<{ value: string }> => {
	return Object.entries(props.headGroups).map(([k, v]) => ({
		value: k,
	}));
});

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
		<fast-breadcrumb-item>{{ pose.id }}</fast-breadcrumb-item>
	</teleport>
	<teleport to="#tree">
		<fast-tree-item @click="$emit('leave')">Back to style</fast-tree-item>
	</teleport>
	<h2>Pose</h2>
	<PInput label="ID" v-model="pose.id" type="id" />
	<details>
		<summary>Render commands</summary>
		<template v-if="pose.renderCommands">
			<table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Folder</th>
						<th>Option</th>
						<th colspan="2">Offset</th>
						<th>Composite</th>
						<th>Action</th>
					</tr>
					<tr>
						<th></th>
						<th></th>
						<th></th>
						<th>X</th>
						<th>Y</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<PoseRenderCommand
						v-for="(command, rcI) in pose.renderCommands"
						:key="'rc-' + rcI"
						:folder="f"
						:command="command"
						:pose-positions="pose.positions ? Object.keys(pose.positions) : []"
						@move-up="moveRcUp(rcI)"
						@move-down="moveRcDown(rcI)"
						@delete="deleteRc(rcI)"
					/>
				</tbody>
			</table>
			<Button @click="pose.renderCommands.push({ type: 'image', images: [] })"
				>Add render command</Button
			>
			<Button
				:disabled="renderCommandsDefaultIssue != ''"
				:title="renderCommandsDefaultIssue"
				@click="delete pose.renderCommands"
				>Switch to default</Button
			>
		</template>
		<template v-else>
			<p>Default render commands: Heads, Left, Right, Variant</p>
			<Button @click="addCustomRenderCommands()"
				>Add custom render commands</Button
			>
		</template>
	</details>
	<details
		v-if="
			(pose.compatibleHeads && pose.compatibleHeads.length > 0) ||
			pose.renderCommands?.find((x) => x.type === 'head')
		"
	>
		<summary>Head groups</summary>
		<Listbox
			multiple
			v-model="selectedHeadGroups"
			:options="headGroupOptions"
			optionLabel="value"
			optionValue="value"
		/>
	</details>
	<Variations
		v-for="(v, k) in pose.positions"
		:label="'' + k"
		:folder="f"
		:variants="v"
		:label-editable="!!pose.renderCommands"
		@update:label="renamePosition(k as string, $event)"
	/>
	<template v-if="!pose.renderCommands">
		<p v-if="!pose.positions?.['Left']">
			<Button
				@click="
					if (!pose.positions) {
						pose.positions = {};
					}
					pose.positions!.Left = [];
				"
				>Create left pose position</Button
			>
		</p>
		<p v-if="!pose.positions?.['Right']">
			<Button
				@click="
					if (!pose.positions) {
						pose.positions = {};
					}
					pose.positions!.Right = [];
				"
				>Create right pose position</Button
			>
		</p>
		<p v-if="!pose.positions?.['Variant']">
			<Button
				@click="
					if (!pose.positions) {
						pose.positions = {};
					}
					pose.positions!.Variant = [];
				"
				>Create variant pose position</Button
			>
		</p>
	</template>
	<Button @click="deleteThis">Delete pose</Button>
	<Code :obj="pose" />
</template>
