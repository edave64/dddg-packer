<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import Code from "../shared/code.vue";
import { joinNormalize } from "../../path-tools";
import type {
	JSONStyleGroup,
	JSONStyle,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Style from "./style.vue";
import PInput from "../shared/p-input.vue";

const props = defineProps({
	styleGroup: {
		required: true,
		type: Object as PropType<JSONStyleGroup>,
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

type State = null | {
	t: "style";
	obj: JSONStyle;
};

const f = computed(() => {
	return joinNormalize(props.folder, props.styleGroup.folder);
});
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item :href="state ? '#' : ''" @click="state = null"
			>Style group '{{ styleGroup.id }}'</fast-breadcrumb-item
		>
	</teleport>
	<template v-if="state === null">
		<teleport to="#tree">
			<fast-tree-item @click="$emit('leave')">Back to character</fast-tree-item>
			<fast-tree-item expanded>
				Styles
				<fast-tree-item
					v-for="s of styleGroup.styles"
					:key="'sg:' + styleGroup.id + 's:' + JSON.stringify(s.components)"
					expanded
					@click="state = { t: 'style', obj: s }"
				>
					{{ s.components ? JSON.stringify(s.components) : "default" }}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style group</h2>
		<p>
			<PInput label="ID" v-model="styleGroup.id" />
		</p>
		<Code :obj="styleGroup" />
	</template>
	<Style
		:style="state.obj"
		:folder="folder"
		@leave="state = null"
		v-else-if="state.t === 'style'"
	/>
</template>
