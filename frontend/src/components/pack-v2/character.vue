<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type {
	JSONCharacter,
	JSONStyleGroup,
	JSONHeadCollection,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import PInput from "../shared/p-input.vue";
import Code from "../shared/code.vue";
import HeadGroup from "./head-group.vue";
import StyleGroup from "./style-group.vue";
import { joinNormalize } from "../../path-tools";
import ImageInput from "../shared/image-input.vue";

const props = defineProps({
	char: {
		required: true,
		type: Object as PropType<JSONCharacter>,
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
			obj: JSONHeadCollection | string[][];
			key: string;
			parent: Exclude<JSONCharacter["heads"], undefined>;
	  }
	| {
			t: "style-group";
			obj: JSONStyleGroup;
	  };
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
			</fast-tree-item>
			<fast-tree-item
				v-if="char.styleGroups && char.styleGroups.length > 0"
				expanded
			>
				Style groups
				<fast-tree-item
					v-for="sg of char.styleGroups"
					:key="'sg:' + sg.id"
					expanded
					@click="state = { t: 'style-group', obj: sg }"
				>
					{{ sg.id }}
				</fast-tree-item>
			</fast-tree-item>
		</teleport>
		<h2>Character</h2>
		<PInput label="ID" v-model="char.id" />
		<PInput label="Label" v-model="char.label" />
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
		@update-key="updateHeadkey(state.key, $event)"
		v-else-if="state && state.t === 'head-group'"
	/>
	<StyleGroup
		:style-group="state.obj"
		:folder="folder"
		@leave="state = null"
		v-else-if="state && state.t === 'style-group'"
	/>
</template>
