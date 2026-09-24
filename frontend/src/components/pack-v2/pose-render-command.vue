<script setup lang="ts">
import ComboBox from "@/components/shared/combo-box.vue";
import { deletableField } from "@/components/shared/deletable-field";
import NumberInput from "@/components/shared/number-input.vue";
import { poseFolder } from "@/store/folders";
import type { JSONPoseCommand } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { ButtonGroup } from "primevue";
import Button from "primevue/button";
import { computed, type PropType } from "vue";

const props = defineProps({
	idx: {
		type: Number,
		required: true,
	},
	isLast: {
		type: Boolean,
		required: true,
	},
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

const f = poseFolder;

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

const composite = deletableField(
	() => props.command as JSONPoseCommand | { composite: "source-over" },
	"composite",
	"source-over",
);

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
			<ComboBox
				:id="`render-command-${idx}-type`"
				style="min-width: 180px"
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
				<ComboBox
					:id="`render-command-${idx}-part`"
					style="min-width: 130px; width: 130px"
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
			<td><input :id="`render-command-${idx}-x`" /></td>
			<td><input :id="`render-command-${idx}-y`" /></td>
		</template>
		<td>
			<NumberInput
				:id="`render-command-${idx}-x`"
				style="width: 70px; display: inline-block"
				v-model="offsetX"
			/>
		</td>
		<td>
			<NumberInput
				:id="`render-command-${idx}-y`"
				style="width: 70px; display: inline-block"
				v-model="offsetY"
			/>
		</td>
		<td>
			<ComboBox
				:id="`render-command-${idx}-composite`"
				style="min-width: 150px"
				v-model="composite"
				:data="compositeOptions"
			/>
		</td>

		<td>
			<ButtonGroup>
				<Button
					:id="`render-command-${idx}-delete`"
					@click="$emit('delete')"
					>Delete</Button
				>
				<Button
					:id="`render-command-${idx}-move-up`"
					:disabled="idx === 0"
					@click="$emit('moveUp')"
					>Up</Button
				>
				<Button
					:id="`render-command-${idx}-move-down`"
					:disabled="isLast"
					@click="$emit('moveDown')"
					>Down</Button
				>
			</ButtonGroup>
		</td>
	</tr>
</template>

<style scoped>
td {
	vertical-align: bottom;
}
</style>
