<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import type {
	INormalizedCharacter,
	INormalizedObject,
} from "@/normalized-dependencies";
import type {
	JSONCharacter,
	JSONHeadCollection,
	JSONStyleGroup,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import { Confirm } from "@wails/go/main/App";
import Button from "primevue/button";
import { computed, ref, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import IdLabelPair from "../shared/id-label-pair.vue";
import HeadGroup from "./head-group.vue";
import StyleGroup from "./style-group.vue";

const props = defineProps({
	char: {
		required: true,
		type: Object as PropType<JSONCharacter>,
	},
	depChar: {
		required: true,
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
	updateCharName: [{ oldName: string; newName: string }];
}>();

const f = computed(() => {
	return joinNormalize(props.folder, props.char.folder);
});

const state = ref(null as State);

function updateHeadkey(oldKey: string, newKey: string) {
	if (state.value?.t !== "head-group") return;
	if (state.value.parent[newKey]) return;
	if (!props.char.heads) return;
	props.char.heads[newKey] = state.value.obj;
	state.value.key = newKey;

	if (props.char.styleGroups) {
		for (const sg of props.char.styleGroups) {
			for (const s of sg.styles) {
				for (const p of s.poses) {
					if (p.compatibleHeads) {
						const idx = p.compatibleHeads.indexOf(oldKey);
						p.compatibleHeads[idx] = newKey;
					}
				}
			}
		}
	}

	delete state.value.parent[oldKey];
}

async function deleteThis() {
	if (
		await Confirm(
			"Do you really want to delete this character extension? This cannot be undone.",
			"Deleting character",
		)
	) {
		emit("delete");
	}
}

function createHeadGroup() {
	const id = seekFreeIds("head_group", Object.keys(props.char.heads ?? {}));
	if (!props.char.heads) {
		props.char.heads = {};
	}
	const obj: JSONHeadCollection = {
		variants: [],
	};
	props.char.heads[id] = obj;
	state.value = {
		t: "head-group",
		obj,
		key: id,
		parent: props.char.heads,
	};
}

function extendHeadGroup(head: INormalizedObject) {
	if (!props.char.heads) {
		props.char.heads = {};
	}
	const obj: JSONHeadCollection = {
		variants: [],
	};
	props.char.heads[head.id] = obj;
	state.value = {
		t: "head-group",
		obj,
		key: head.id,
		parent: props.char.heads,
	};
}

function createStyleGroup() {
	const id = seekFreeIds(
		"style_group",
		props.char.styleGroups?.map((x) => x.id) ?? [],
	);
	if (!props.char.styleGroups) {
		props.char.styleGroups = [];
	}
	const obj: JSONStyleGroup = {
		id,
		styles: [
			{
				poses: [],
			},
		],
	};
	props.char.styleGroups.push(obj);
	state.value = {
		t: "style-group",
		obj,
	};
}

function extentStyleGroup(styleGroup: INormalizedObject) {
	if (!props.char.styleGroups) {
		props.char.styleGroups = [];
	}
	const obj: JSONStyleGroup = {
		id: styleGroup.id,
		styles: [],
	};
	props.char.styleGroups.push(obj);
	state.value = {
		t: "style-group",
		obj,
	};
}

type State =
	| null
	| {
			t: "head-group";
			obj: JSONHeadCollection | string[][];
			key: string;
			parent: Exclude<JSONCharacter["heads"], undefined>;
	  }
	| {
			t: "style-group";
			obj: JSONStyleGroup;
	  };

function deleteObj() {
	const s = state.value;
	if (s === null) return;
	state.value = null;
	switch (s.t) {
		case "head-group":
			if (!props.char.heads) break;
			delete props.char.heads[s.key];
			if (Object.keys(props.char.heads).length === 0) {
				delete props.char.heads;
			}
			break;
		case "style-group": {
			if (!props.char.styleGroups) break;
			const idx = props.char.styleGroups.findIndex((x) => x.id === s.obj.id);
			props.char.styleGroups?.splice(idx, 1);
			if (props.char.styleGroups.length === 0) {
				delete props.char.styleGroups;
			}
			break;
		}
	}
}

const label = computed({
	get() {
		return props.char.label ? props.char.label : props.char.id;
	},
	set(value: string) {
		const old = props.char.label ?? "";
		props.char.label = value;
		emit("updateCharName", { oldName: old, newName: value });
	},
});

const availableHeads = computed(() => {
	const ids = Object.keys(props.char.heads ?? {});
	return props.depChar.headGroups.filter((x) => !ids.includes(x.id));
});

const availableStyleGroups = computed(() => {
	const ids = props.char.styleGroups?.map((x) => x.id) ?? [];
	return props.depChar.styleGroups.filter((x) => !ids.includes(x.id));
});
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item :href="state ? '#' : ''" @click="state = null">{{
			char.id
		}}</fast-breadcrumb-item>
	</teleport>
	<template v-if="state === null">
		<teleport to="#tree">
			<fast-tree-item @click="$emit('leave')">Back to pack</fast-tree-item>

			<fast-tree-item
				v-if="
					(!char.heads || Object.keys(char.heads).length === 0) &&
					availableHeads.length === 0
				"
				@click="createHeadGroup"
			>
				Add head group
			</fast-tree-item>
			<fast-tree-item v-else expanded>
				Heads
				<fast-tree-item
					v-for="(v, k) of char.heads"
					expanded
					:key="'head:' + k"
					@click="
						state = {
							t: 'head-group',
							obj: v,
							key: k as string,
							parent: char.heads!,
						}
					"
				>
					{{ k }}
				</fast-tree-item>
				<fast-tree-item @click="createHeadGroup">
					Add head group
				</fast-tree-item>
				<fast-tree-item
					v-for="head in availableHeads"
					:key="head.id"
					@click="extendHeadGroup(head)"
				>
					Extend {{ head.label }}
				</fast-tree-item>
			</fast-tree-item>
			<fast-tree-item
				v-if="
					(!char.styleGroups || char.styleGroups.length === 0) &&
					availableStyleGroups.length === 0
				"
				@click="createStyleGroup"
			>
				Add style group
			</fast-tree-item>
			<fast-tree-item v-else expanded>
				Style groups
				<fast-tree-item
					v-for="sg of char.styleGroups"
					:key="'sg:' + sg.id"
					expanded
					@click="state = { t: 'style-group', obj: sg }"
				>
					{{ sg.id }}
				</fast-tree-item>
				<fast-tree-item @click="createStyleGroup">
					Add style group
				</fast-tree-item>
				<fast-tree-item
					v-for="sg in availableStyleGroups"
					:key="sg.id"
					@click="extentStyleGroup(sg)"
				>
					Extend {{ sg.label }}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Character extension</h2>
		<IdLabelPair :id="char.id" :label="char.label ?? depChar.label" disabled />
		<Button @click="deleteThis">Delete character extension</Button>
		<Code :obj="char" />
	</template>
	<HeadGroup
		:head-group="state.obj"
		:folder="folder"
		:id="state.key"
		:depChar="depChar"
		@leave="state = null"
		@update-key="updateHeadkey(state.key, $event)"
		@delete="deleteObj"
		v-else-if="state && state.t === 'head-group'"
	/>
	<StyleGroup
		v-else-if="state && state.t === 'style-group'"
		:style-group="state.obj"
		:folder="folder"
		:head-groups="char.heads ?? {}"
		:depChar="depChar"
		@leave="state = null"
		@delete="deleteObj"
	/>
</template>
