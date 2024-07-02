<script setup lang="ts">
import {
	getStyleId,
	type INormalizedCharacter,
	type INormalizedStyle,
} from "@/normalized-dependencies";
import type {
	JSONHeadCollections,
	JSONStyle,
	JSONStyleGroup,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
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
	depChar: {
		type: Object as PropType<INormalizedCharacter>,
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

const depStyleGroup = computed(() => {
	if (!props.depChar) return null;
	return props.depChar.styleGroups.find((x) => x.id === props.styleGroup.id);
});

const isExtension = computed(() => {
	return !!depStyleGroup.value;
});

const availableStylesExts = computed(() => {
	const styles = depStyleGroup.value?.styles;
	if (!styles) return [];
	const allStyles = props.styleGroup.styles.map((x) =>
		getStyleId(x.components),
	);
	return styles.filter((x) => !allStyles.includes(x.id));
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

function extendStyle(style: INormalizedStyle) {
	if (!props.styleGroup.styles) {
		props.styleGroup.styles = [];
	}
	const obj: JSONStyle = {
		components: Object.keys(style.parts).length > 0 ? style.parts : undefined,
		poses: [],
	};
	props.styleGroup.styles.push(obj);
	state.value = {
		t: "style",
		obj,
	};
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
				<fast-tree-item
					v-for="s of availableStylesExts"
					:key="'sg:' + styleGroup.id + 's:' + JSON.stringify(s.parts)"
					expanded
					@click="extendStyle(s)"
				>
					Extend
					{{
						s.parts && Object.keys(s.parts).length > 0
							? JSON.stringify(s.parts)
							: "default"
					}}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Style group {{ isExtension ? "extension" : "" }}</h2>
		<p>
			<PInput
				label="ID"
				v-model="styleGroup.id"
				type="id"
				:disabled="isExtension"
			/>
		</p>
		<Button @click="deleteThis"
			>Delete style group {{ isExtension ? "extension" : "" }}</Button
		>
		<Code :obj="styleGroup" />
	</template>
	<Style
		:style-obj="state.obj"
		:folder="folder"
		:head-groups="headGroups"
		:depChar="depChar"
		:depStyle="
			depStyleGroup?.styles.find(
				(x) => x.id === getStyleId(state!.obj.components),
			)
		"
		@leave="state = null"
		v-else-if="state.t === 'style'"
	/>
</template>
