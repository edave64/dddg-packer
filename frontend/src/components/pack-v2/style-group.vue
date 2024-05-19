<script setup lang="ts">
import type {
	JSONHeadCollections,
	JSONStyle,
	JSONStyleGroup,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import { computed, ref, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import Style from "./style.vue";

const props = defineProps({
	styleGroup: {
		required: true,
		type: Object as PropType<JSONStyleGroup>,
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

const state = ref(null as State);

type State = null | {
	t: "style";
	obj: JSONStyle;
};

const f = computed(() => {
	return joinNormalize(props.folder, props.styleGroup.folder);
});

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this style group? This cannot be undone.",
			"Deleting style group",
		)
	) {
		emit("delete");
	}
}
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
		<fast-button @click="deleteThis">Delete character</fast-button>
		<Code :obj="styleGroup" />
	</template>
	<Style
		:style="state.obj"
		:folder="folder"
		:head-groups="headGroups"
		@leave="state = null"
		v-else-if="state.t === 'style'"
	/>
</template>
