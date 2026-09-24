<script setup lang="ts">
import { aryFindRemove, aryMove } from "@/array-tools";
import PoseRenderCommand from "@/components/pack-v2/pose-render-command.vue";
import Variations from "@/components/pack-v2/variations.vue";
import Code from "@/components/shared/code.vue";
import PInput from "@/components/shared/p-input.vue";
import { renameKey } from "@/obj-tools";
import { go, setTemporaryAlias, useParams } from "@/router";
import {
	useCharacter,
	usePackId,
	usePose,
	useStyle,
	useStyleGroup,
} from "@/store/active-pack";
import { useNormalizedDependecyTree } from "@/store/dependencies";
import { poseFolder } from "@/store/folders";
import type { JSONPoseCommand } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import Listbox from "primevue/listbox";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const f = poseFolder;

const pose = usePose();

const defaultParts = ["Left", "Right", "Variant"];

const renderCommandsDefaultIssue = computed(() => {
	const poseV = pose.value;
	if (!poseV) return "";
	const rcs = poseV.renderCommands;
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
	const poseV = pose.value;
	if (!poseV) return;
	const commands: JSONPoseCommand[] = [];
	if (poseV.compatibleHeads && poseV.compatibleHeads.length > 0) {
		commands.push({ type: "head" });
	}
	if (poseV.positions) {
		for (const part of defaultParts) {
			if (poseV.positions && poseV.positions[part] != null) {
				commands.push({ type: "pose-part", part });
			}
		}
		for (const part in poseV.positions) {
			if (!defaultParts.includes(part)) {
				commands.push({ type: "pose-part", part });
			}
		}
	}
	poseV.renderCommands = commands;
}

function moveRcUp(index: number) {
	const poseV = pose.value;
	if (!poseV) return;
	const rcs = poseV.renderCommands;
	if (!rcs) return;
	aryMove(rcs, index, index - 1);
}

function moveRcDown(index: number) {
	const poseV = pose.value;
	if (!poseV) return;
	const rcs = poseV.renderCommands;
	if (!rcs) return;
	aryMove(rcs, index, index + 1);
}

function deleteRc(index: number) {
	const poseV = pose.value;
	if (!poseV) return;
	const rcs = poseV.renderCommands;
	if (!rcs) return;
	rcs.splice(index, 1);
}

function renamePosition(oldName: string, newName: string) {
	const poseV = pose.value;
	if (!poseV || !poseV.positions) return;
	const newPositions = renameKey(poseV.positions, oldName, newName);
	if (newPositions === null) return;
	poseV.positions = newPositions;
	if (poseV.renderCommands) {
		for (const rc of poseV.renderCommands) {
			if (rc.type === "pose-part" && rc.part === oldName) {
				rc.part = newName;
			}
		}
	}
}

const route = useRoute();

const params = useParams();

async function deleteThis() {
	const styleId = params.value.styleId as string;
	const styleV = useStyle().value;
	const charV = useCharacter().value;
	const sgV = useStyleGroup().value;
	if (!styleV || !styleV.poses || !charV || !sgV || styleId == null) return;
	if (
		await Confirm(
			"Do you really want to delete this pose? This cannot be undone.",
			"Deleting pose",
		)
	) {
		go("style", {
			packId: usePackId().value!,
			charId: charV.id,
			styleGroupId: sgV.id,
			styleId,
		});
		aryFindRemove(styleV.poses, (x) => x.id === pose.value?.id);
	}
}

const headGroupOptions = computed((): Array<{ value: string }> => {
	const charV = useCharacter().value;
	const depCharV = useNormalizedDependecyTree().value.characters.find(
		(x) => x.id === charV?.id,
	);
	if (!charV) return [];
	return [
		...Object.entries(charV.heads ?? {}).map(([k, v]) => ({
			value: k,
		})),
		...(depCharV?.headGroups ?? []).map((x) => ({ value: x.id })),
	];
});

const selectedHeadGroups = computed({
	get() {
		return pose.value?.compatibleHeads ?? [];
	},
	set(value: string[]) {
		const poseV = pose.value;
		if (!poseV) return;
		if (value.length === 0) {
			if (poseV.compatibleHeads) {
				delete poseV.compatibleHeads;
			}
		} else {
			poseV.compatibleHeads = value;
		}
	},
});

const depPose = computed(() => {
	const depCharV = useNormalizedDependecyTree().value.characters.find(
		(x) => x.id === useCharacter().value?.id,
	);
	const depSGV = depCharV?.styleGroups.find(
		(x) => x.id === useStyleGroup().value?.id,
	);
	const seek = JSON.stringify(useStyle().value?.components);
	const depStyleV = depSGV?.styles.find(
		(x) => JSON.stringify(x.parts) === seek,
	);
	return depStyleV?.poses.find((x) => x.id === pose.value?.id);
});

const isExtension = computed(() => {
	return !!depPose.value;
});

const customPosName = ref("");

function addPosePosition(part: string) {
	const poseV = pose.value;
	if (!poseV) return;
	poseV.positions ??= {};
	poseV.positions[part] = [];
}

const id = computed({
	get: () => pose.value?.id ?? "",
	set: (value) => {
		const poseV = pose.value;
		if (!poseV) return;

		setTemporaryAlias("poseId", poseV.id, value);
		poseV.id = value;
	},
});
</script>
<template>
	<template v-if="pose">
		<h2>Pose {{ isExtension ? "extension" : "" }}</h2>
		<PInput
			id="pose-id"
			label="ID"
			v-model="id"
			type="id"
			delayed
			:disabled="isExtension"
		/>
		<details v-if="!isExtension">
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
							:is-last="rcI === pose.renderCommands.length - 1"
							:idx="rcI"
							:folder="f"
							:command="command"
							:pose-positions="
								pose.positions ? Object.keys(pose.positions) : []
							"
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
				!isExtension &&
				((pose.compatibleHeads && pose.compatibleHeads.length > 0) ||
					pose.renderCommands?.find((x) => x.type === 'head') ||
					!pose.renderCommands)
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
			id="pose-variants"
			v-for="(v, k) in pose.positions"
			:label="'' + k"
			:folder="f"
			:variants="v"
			:label-editable="!!pose.renderCommands"
			@update:label="renamePosition(k as string, $event)"
		/>
		<template v-if="depPose" v-for="k in depPose.positions" :key="k">
			<p v-if="!Object.prototype.hasOwnProperty.call(pose.positions, k)">
				<Button @click="addPosePosition(k)"
					>Create {{ k }} pose position</Button
				>
			</p>
		</template>
		<template v-else-if="!pose.renderCommands">
			<template v-for="position in ['Left', 'Right', 'Variant']">
				<p v-if="!pose.positions?.[position]">
					<Button @click="addPosePosition(position)"
						>Create {{ position }} pose position</Button
					>
				</p></template
			>
		</template>
		<template v-else>
			<p>
				<PInput
					id="pose-position-name"
					label="Pose position"
					v-model="customPosName"
				/>
				<Button @click="addPosePosition(customPosName)"
					>Create {{ customPosName }} pose position</Button
				>
			</p>
		</template>
		<Button @click="deleteThis">Delete pose</Button>
		<Code :obj="pose" />
	</template>
</template>
