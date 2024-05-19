<script setup lang="ts">
import { seekFreeIds } from "@/array-tools";
import type {
	JSONHeadCollection,
	JSONHeadCollections,
	JSONPoseMeta,
	JSONStyle,
	JSONCharacter as V1Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";
import { computed, ref, type PropType } from "vue";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import ImageInput from "../shared/image-input.vue";
import PInput from "../shared/p-input.vue";
import HeadGroup from "./head-group.vue";
import type { HeadDummy } from "./headDummy";
import Style from "./style.vue";

const props = defineProps({
	char: {
		required: true,
		type: Object as PropType<V1Json<HeadDummy>>,
	},
	folder: {
		type: String,
		required: true,
	},
});

const emit = defineEmits<{
	leave: [];
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
	delete state.value.parent[oldKey];
}

type State =
	| null
	| {
			t: "head-group";
			obj: JSONHeadCollection | Array<string | NsfwAbleImg>;
			key: string;
			parent: JSONHeadCollections;
	  }
	| {
			t: "style";
			obj: JSONStyle;
	  }
	| {
			t: "pose";
			obj: JSONPoseMeta<HeadDummy>;
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
			if (props.char.poses) {
				for (const pose of props.char.poses) {
					if (pose.compatibleHeads) {
						const idx = pose.compatibleHeads.indexOf(s.key);
						pose.compatibleHeads.splice(idx, 1);
					}
				}
			}
			break;
		case "style": {
			if (!props.char.styles) break;
			const idx = props.char.styles.findIndex((x) => x.name === s.obj.name);
			props.char.styles.splice(idx, 1);
			if (props.char.styles.length === 0) {
				delete props.char.styles;
			}
			if (props.char.poses) {
				const list = props.char.poses;
				const l = list.length;
				for (let i = 0; i < l; ++i) {
					const pose = list[i];
					if (pose.style === s.obj.name) {
						list.splice(i, 1);
						--i;
					}
				}
			}
			break;
		}
	}
}

function createHeadGroup() {
	const id = seekFreeIds("heads", Object.keys(props.char.heads ?? {}));
	if (!props.char.heads) {
		props.char.heads = {};
	}
	const obj: string[] = [];
	props.char.heads[id] = obj;
	state.value = {
		t: "head-group",
		obj,
		key: id,
		parent: props.char.heads,
	};
}

function createStyle() {
	const id = seekFreeIds(
		"style",
		props.char.styles?.map((x) => x.name),
	);
	if (!props.char.styles) {
		props.char.styles = [];
	}
	const obj: JSONStyle = {
		label: id,
		name: id,
	};
	props.char.styles.push(obj);
	state.value = {
		t: "style",
		obj,
	};
}
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
				v-if="char.heads && Object.keys(char.heads).length > 0"
				expanded
			>
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
							parent: char.heads,
						}
					"
				>
					{{ k }}
				</fast-tree-item>
				<fast-tree-item @click="createHeadGroup">Add head group</fast-tree-item>
			</fast-tree-item>
			<fast-tree-item v-else @click="createHeadGroup"
				>Add head group</fast-tree-item
			>
			<fast-tree-item v-if="char.styles && char.styles.length > 0" expanded>
				Styles
				<fast-tree-item
					v-for="sg of char.styles"
					:key="'sg:' + sg.name"
					expanded
					@click="state = { t: 'style', obj: sg }"
				>
					{{ sg.label }}
				</fast-tree-item>
				<fast-tree-item @click="createStyle">Add style group</fast-tree-item>
			</fast-tree-item>
			<fast-tree-item v-else @click="createStyle"
				>Add style group</fast-tree-item
			>
		</teleport>
		<h2>Character</h2>
		<PInput label="ID" v-model="char.id" />
		<PInput label="Label" v-model="char.name" />
		<p>
			<ImageInput label="Chibi" v-model="char.chibi" />
			<br />
			<img :src="joinNormalize(f, char.chibi)" />
		</p>
		<Code :obj="char" />
	</template>
	<HeadGroup
		:head-group="state.obj"
		:folder="folder"
		:id="state.key"
		@leave="state = null"
		@delete="deleteObj"
		@update-key="updateHeadkey(state.key, $event)"
		v-else-if="state && state.t === 'head-group'"
	/>
	<Style
		:style="state.obj"
		:folder="folder"
		:char="char"
		@delete="deleteObj"
		@leave="state = null"
		v-else-if="state && state.t === 'style'"
	/>
</template>
