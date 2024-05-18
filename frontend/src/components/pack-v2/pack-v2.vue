<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type {
	JSONBackground,
	JSONCharacter,
	JSONColor,
	JSONSprite,
	JSONContentPack as V2Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Sprites from "./sprites.vue";
import Background from "./background.vue";
import Character from "./character.vue";
import PInput from "../shared/p-input.vue";
import { joinNormalize } from "../../path-tools";
import { MountPack } from "../../../wailsjs/go/main/App";
import type { ISupportedRepo } from "@/repo";
import Code from "../shared/code.vue";
import ImageCollection from "./image-collection.vue";

const props = defineProps({
	json: {
		required: true,
		type: Object as PropType<V2Json>,
	},
	repo: {
		required: true,
		type: Object as PropType<ISupportedRepo>,
	},
	id: {
		required: true,
		type: String,
	},
});

const root = joinNormalize("", "./");
const folder = computed(() => {
	return joinNormalize(root, props.json.folder);
});

const state = ref(null as State);

type State =
	| null
	| {
			t: "char";
			obj: JSONCharacter;
	  }
	| {
			t: "sprite";
			obj: JSONSprite;
	  }
	| {
			t: "background";
			obj: JSONBackground;
	  }
	| {
			t: "color";
			obj: JSONColor;
	  };

function reset() {
	state.value = null;
}

function createBackground() {
	const id = seekFreeIds(props.json.backgrounds ?? [], "background");
	if (!props.json.backgrounds) {
		props.json.backgrounds = [];
	}
	const obj: JSONBackground = {
		id,
		variants: [],
		label: "New Background",
	};
	props.json.backgrounds.push(obj);
	state.value = {
		t: "background",
		obj,
	};
}

function createSprite() {
	const id = seekFreeIds(props.json.sprites ?? [], "sprite");
	if (!props.json.sprites) {
		props.json.sprites = [];
	}
	const obj: JSONSprite = {
		id,
		variants: [],
		label: "New Sprite",
	};
	props.json.sprites.push(obj);
	state.value = {
		t: "sprite",
		obj,
	};
}

function seekFreeIds(list: { id: string }[], prefix: string) {
	let i = list.length;
	let ret: string;
	do {
		++i;
		ret = `${prefix}_${i}`;
	} while (list.find((x) => x.id === ret));
	return ret;
}

function deleteObj() {
	const s = state.value;
	if (s === null) return;
	state.value = null;
	const list = (
		{
			char: props.json.backgrounds,
			sprite: props.json.sprites,
			background: props.json.backgrounds,
		} as Record<string, Array<{ id: string }>>
	)[s.t];

	const idx = list.findIndex((x) => x.id === s.obj.id);
	list.splice(idx, 1);
	if (list.length === 0) {
		switch (s.t) {
			case "char":
				delete props.json.characters;
				break;
			case "sprite":
				delete props.json.sprites;
				break;
			case "background":
				delete props.json.backgrounds;
				break;
			case "color":
				delete props.json.colors;
				break;
		}
	}
}
</script>
<template>
	<teleport to="#breadcrumb">
		<fast-breadcrumb-item :href="state ? '#' : ''" @click="state = null">{{
			id
		}}</fast-breadcrumb-item>
	</teleport>
	<div class="pack_wrapper">
		<template v-if="state === null">
			<teleport to="#tree">
				<fast-tree-item @click="MountPack('')">Back to packs</fast-tree-item>
				<fast-tree-item v-if="!json.characters || json.characters.length === 0"
					>Add character</fast-tree-item
				>
				<fast-tree-item expanded v-else>
					Characters
					<fast-tree-item
						v-for="char in json.characters!"
						:key="'char:' + char.id"
						@click="state = { t: 'char', obj: char }"
					>
						{{ char.label ? `${char.label} [${char.id}]` : char.id }}
					</fast-tree-item>
					<fast-tree-item>Add character</fast-tree-item>
				</fast-tree-item>
				<fast-tree-item
					@click="createSprite"
					v-if="!json.sprites || json.sprites.length === 0"
					>Add sprite</fast-tree-item
				>
				<fast-tree-item expanded v-else>
					Sprites
					<fast-tree-item
						v-for="sprite in json.sprites"
						:key="'sprite:' + sprite.id"
						@click="state = { t: 'sprite', obj: sprite }"
					>
						{{ sprite.label ? `${sprite.label} [${sprite.id}]` : sprite.id }}
					</fast-tree-item>
					<fast-tree-item @click="createSprite">Add sprite</fast-tree-item>
				</fast-tree-item>
				<fast-tree-item
					v-if="!json.backgrounds || json.backgrounds.length === 0"
					@click="createBackground"
					>Add background</fast-tree-item
				>
				<fast-tree-item expanded v-else>
					Background
					<fast-tree-item
						v-for="background in json.backgrounds"
						:key="'background:' + background.id"
						@click="state = { t: 'background', obj: background }"
					>
						{{
							background.label
								? `${background.label} [${background.id}]`
								: background.id
						}}
					</fast-tree-item>
					<fast-tree-item @click="createBackground"
						>Add background</fast-tree-item
					>
				</fast-tree-item>
			</teleport>
			<h2>Pack</h2>
			<PInput label="ID" v-model="repo.pack.id" />
			<PInput label="Name" v-model="repo.pack.name" />
			<PInput label="Source" v-model="repo.pack.source" />
			<PInput label="Description" v-model="repo.pack.description" />
			<ImageCollection
				title="Preview"
				:imageCollection="repo.pack.preview"
				folder="./"
			/>
			<Code :obj="repo" />
		</template>
		<Sprites
			:sprite="state.obj"
			:folder="folder"
			@leave="reset"
			@delete="deleteObj"
			v-else-if="state.t === 'sprite'"
		/>
		<Character
			:char="state.obj"
			:folder="folder"
			@leave="reset"
			@delete="deleteObj"
			v-else-if="state.t === 'char'"
		/>
		<Background
			:background="state.obj"
			:folder="folder"
			@leave="reset"
			@delete="deleteObj"
			v-else-if="state.t === 'background'"
		/>
	</div>
</template>
<style>
.pack_wrapper {
	width: 100%;
	height: 100%;
	overflow: auto;
}
</style>
