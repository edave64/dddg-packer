<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONPoseCommand } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { joinNormalize } from "../../path-tools";
import Combo from "../shared/combo.vue";
import NumberInput from "../shared/number-input.vue";

const props = defineProps({
	command: {
		required: true,
		type: Object as PropType<JSONPoseCommand>,
	},
	posePositions: {
		required: true,
		type: Array as PropType<string[]>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	moveUp: [];
	moveDown: [];
	delete: [];
}>();

const f = computed(() => {
	return joinNormalize(
		props.folder,
		props.command.type === "image" ? props.command.folder : undefined
	);
});

const offsetX = computed({
	get(): number {
		if (props.command.offset) return props.command.offset[0];
		return 0;
	},
	set(val: number) {
		if (!props.command.offset && val === 0) return;
		if (props.command.offset && props.command.offset[0] === val) return;
		if (val === 0) {
			if (props.command.offset) {
				if (offsetY.value === 0) {
					// biome-ignore lint/performance/noDelete: <explanation>
					delete props.command.offset;
					return;
				}
			}
		}
		if (!props.command.offset) {
			props.command.offset = [0, 0];
		}
		props.command.offset[0] = val;
	},
});

const offsetY = computed({
	get(): number {
		if (props.command.offset) return props.command.offset[1];
		return 0;
	},
	set(val: number) {
		if (!props.command.offset && val === 0) return;
		if (props.command.offset && props.command.offset[1] === val) return;
		if (val === 0) {
			if (props.command.offset) {
				if (offsetX.value === 0) {
					// biome-ignore lint/performance/noDelete: <explanation>
					delete props.command.offset;
					return;
				}
			}
		}
		if (!props.command.offset) {
			props.command.offset = [0, 0];
		}
		props.command.offset[1] = val;
	},
});

type CompositeType = Exclude<
	JSONPoseCommand["composite"] | "source-over",
	undefined
>;

const composite = computed({
	get(): CompositeType {
		return props.command.composite ?? "source-over";
	},
	set(val: CompositeType) {
		if (val === "source-over" && props.command.composite === undefined) return;
		if (props.command.composite === val) return;
		if (val === "source-over") {
			// biome-ignore lint/performance/noDelete: <explanation>
			delete props.command.composite;
			return;
		}
		props.command.composite = val;
	},
});

const compositeOptions = [
	{
		label: "Normal",
		value: "source-over",
	},
	...[
		"source-in",
		"source-out",
		"source-atop",
		"destination-over",
		"destination-in",
		"destination-out",
		"destination-atop",
		"lighter",
		"copy",
		"xor",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity",
	].map((x) => ({
		label: x,
		value: x,
	})),
];
</script>
<template>
	<tr>
		<td>
			<Combo
				style="min-width: 140px"
				v-model="command.type"
				:data="[
					{ label: 'Pose position', value: 'pose-part' },
					{ label: 'Head', value: 'head' },
					{ label: 'Images', value: 'image' },
				]"
			/>
		</td>
		<template v-if="command.type === 'pose-part'">
			<td></td>
			<td>
				<Combo
					style="min-width: 100px; width: 100px"
					v-model="command.part"
					:data="
						posePositions.map((x) => ({
							label: x,
							value: x,
						}))
					"
				/>
			</td>
		</template>
		<template v-else-if="command.type === 'head'">
			<td></td>
			<td></td>
		</template>
		<template v-else-if="command.type === 'image'">
			<td><input /></td>
			<td><input /></td>
		</template>
		<td>
			<NumberInput
				label="X"
				style="width: 70px; display: inline-block"
				v-model="offsetX"
			/>
			<NumberInput
				label="Y"
				style="width: 70px; display: inline-block"
				v-model="offsetY"
			/>
		</td>
		<td>
			<Combo
				style="min-width: 150px"
				v-model="composite"
				:data="compositeOptions"
			/>
		</td>

		<td>
			<fast-button @click="$emit('delete')">Delete</fast-button>
			<fast-button @click="$emit('moveUp')">Up</fast-button>
			<fast-button @click="$emit('moveDown')">Down</fast-button>
		</td>
	</tr>
</template>

<style scoped>
td {
	vertical-align: bottom;
}
</style>
