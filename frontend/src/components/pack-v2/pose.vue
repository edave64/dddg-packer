<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { JSONPose } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import Variations from "./variations.vue";

const props = defineProps({
	pose: {
		required: true,
		type: Object as PropType<JSONPose>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const f = computed(() => {
	return joinNormalize(props.folder, props.pose.folder);
});
</script>
<template>
	<h2>Pose</h2>
	<p>
		<label for="pose_id">ID: </label>
		<input id="pose_id" v-model="pose.id" />
	</p>
	<table>
		<thead>
			<tr>
				<th>Render commands</th>
			</tr>
			<tr>
				<th>Type</th>
				<th>Folder</th>
				<th>Option</th>
				<th>Offset</th>
				<th>Composite</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(command, rcKey) in pose.renderCommands" :key="'rc-' + rcKey">
				<td>
					<select v-model="command.type">
						<option value="pose-part">Pose position</option>
						<option value="head">Head</option>
						<option value="image">Images</option>
					</select>
				</td>
				<template v-if="command.type === 'pose-part'">
					<td></td>
					<td>
						<select v-model="command.part">
							<option
								v-for="(_, key) of pose.positions"
								:key="'pose-position:' + key"
								:value="key"
							>
								{{ key }}
							</option>
						</select>
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
					<label :for="'rc-offset-x:' + rcKey">X:</label>
					<input
						:id="'rc-offset-x:' + rcKey"
						type="number"
						step="1"
						style="width: 32px"
					/>
					<label :for="'rc-offset-y:' + rcKey">Y:</label>
					<input
						:id="'rc-offset-y:' + rcKey"
						type="number"
						step="1"
						style="width: 32px"
					/>
				</td>
				<td>
					<select v-model="command.composite">
						<option value="source-in">source-in</option>
						<option value="source-out">source-out</option>
						<option value="source-atop">source-atop</option>
						<option value="destination-over">destination-over</option>
						<option value="destination-in">destination-in</option>
						<option value="destination-out">destination-out</option>
						<option value="destination-atop">destination-atop</option>
						<option value="lighter">lighter</option>
						<option value="copy">copy</option>
						<option value="xor">xor</option>
						<option value="multiply">multiply</option>
						<option value="screen">screen</option>
						<option value="overlay">overlay</option>
						<option value="darken">darken</option>
						<option value="lighten">lighten</option>
						<option value="color-dodge">color-dodge</option>
						<option value="color-burn">color-burn</option>
						<option value="hard-light">hard-light</option>
						<option value="soft-light">soft-light</option>
						<option value="difference">difference</option>
						<option value="exclusion">exclusion</option>
						<option value="hue">hue</option>
						<option value="saturation">saturation</option>
						<option value="color">color</option>
						<option value="luminosity">luminosity</option>
					</select>
				</td>

				<td>
					<button>Delete</button>
					<button>Up</button>
					<button>Down</button>
				</td>
			</tr>
		</tbody>
	</table>
	<Variations
		v-for="(v, k) in pose.positions"
		:label="'' + k"
		:folder="f"
		:variants="v"
	/>
	<Code :obj="pose" />
</template>
