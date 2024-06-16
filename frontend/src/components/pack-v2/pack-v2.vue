<script setup lang="ts">
import { aryFindRemove, aryRemove, seekFreeIds } from "@/array-tools";
import type { IPack, ISupportedRepo } from "@/repo";
import type {
	JSONBackground,
	JSONCharacter,
	JSONColor,
	JSONSprite,
	JSONContentPack as V2Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Button from "primevue/button";
import { computed, ref, type PropType } from "vue";
import { MountPack, OpenFolder } from "../../../wailsjs/go/main/App";
import { joinNormalize } from "../../path-tools";
import Code from "../shared/code.vue";
import PInput from "../shared/p-input.vue";
import Background from "./background.vue";
import Character from "./character.vue";
import Dependencies from "./dependencies.vue";
import ImageCollection from "./image-collection.vue";
import Sprites from "./sprites.vue";

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

window.j = props.json;

if (!props.json.dependencies) {
	const deps = new Set<string>();
	for (const char of props.json.characters ?? []) {
		if (!char.id.includes(":")) continue;
		deps.add(char.id.split(":")[0]);

		for (const styleGroup of char.styleGroups ?? []) {
			if (!styleGroup.id.includes(":")) continue;
			deps.add(styleGroup.id.split(":")[0]);

			for (const style of styleGroup.styles ?? []) {
				for (const pose of style.poses ?? []) {
					if (pose.id.includes(":")) {
						deps.add(pose.id.split(":")[0]);
					}

					for (const head of pose.compatibleHeads ?? []) {
						if (!head.includes(":")) continue;
						deps.add(head.split(":")[0]);
					}
				}
			}
		}

		for (const head of Object.keys(char.heads ?? {})) {
			if (!head.includes(":")) continue;
			deps.add(head.split(":")[0]);
		}
	}

	for (const sprite of props.json.sprites ?? []) {
		if (!sprite.id.includes(":")) continue;
		deps.add(sprite.id.split(":")[0]);
	}

	for (const background of props.json.backgrounds ?? []) {
		if (!background.id.includes(":")) continue;
		deps.add(background.id.split(":")[0]);
	}

	// TODO: Typing of dependencies is messed up
	props.json.dependencies = Array.from(deps) as [];
}

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
	const id = seekFreeIds(
		"background",
		props.json.backgrounds?.map((x) => x.id),
	);
	if (!props.json.backgrounds) {
		props.json.backgrounds = [];
	}
	const obj: JSONBackground = {
		id,
		variants: [],
		label: "New Background",
	};
	props.json.backgrounds.push(obj);
	addKind("Backgrounds");
	state.value = {
		t: "background",
		obj,
	};
}

function createCharacter() {
	const id = seekFreeIds(
		"character",
		props.json.backgrounds?.map((x) => x.id),
	);
	if (!props.json.characters) {
		props.json.characters = [];
	}
	const obj: JSONCharacter = {
		id,
		label: "New Character",
	};
	props.json.characters.push(obj);
	props.repo.pack.characters.push(obj.label as string);
	addKind("Characters");

	state.value = {
		t: "char",
		obj,
	};
}

function createSprite() {
	const id = seekFreeIds(
		"sprite",
		props.json.sprites?.map((x) => x.id),
	);
	if (!props.json.sprites) {
		props.json.sprites = [];
	}
	const obj: JSONSprite = {
		id,
		variants: [],
		label: "New Sprite",
	};
	props.json.sprites.push(obj);
	addKind("Sprites");
	state.value = {
		t: "sprite",
		obj,
	};
}

function addKind(kind: IPack["kind"][0]) {
	if (!props.repo.pack.kind) {
		props.repo.pack.kind = [kind];
	} else if (!props.repo.pack.kind.includes(kind)) {
		props.repo.pack.kind.push(kind);
	}
}

function deleteObj() {
	const s = state.value;
	if (s === null) return;
	if (s.t === "color") {
		aryFindRemove(props.json.colors, (x) => x.color === s.obj.color);
		return;
	}
	state.value = null;
	const list = (
		{
			char: props.json.characters,
			sprite: props.json.sprites,
			background: props.json.backgrounds,
		} as Record<typeof s.t, Array<{ id: string }>>
	)[s.t];

	aryFindRemove(list, (x) => x.id === s.obj.id);

	if (s.t === "char") {
		aryRemove(props.repo.pack.characters, s.obj.label as string);

		const oldClassification = classifyChar(s.obj);
		const remainingClassifications =
			props.json.characters?.reduce(
				(acc, char) => acc | classifyChar(char),
				0,
			) ?? 0;
		for (const kind of [
			"Characters",
			"Styles",
			"Poses",
			"Expressions",
		] as const) {
			if (
				oldClassification & CharClassification[kind] &&
				!(remainingClassifications & CharClassification[kind])
			) {
				aryRemove(props.repo.pack.kind, kind);
			}
		}
	}

	if (list.length === 0) {
		switch (s.t) {
			case "char": {
				delete props.json.characters;
				aryRemove(props.repo.pack.kind, "Characters");
				break;
			}
			case "sprite": {
				delete props.json.sprites;
				aryRemove(props.repo.pack.kind, "Sprites");
				break;
			}
			case "background": {
				delete props.json.backgrounds;
				aryRemove(props.repo.pack.kind, "Backgrounds");
				break;
			}
		}
	}
}

enum CharClassification {
	Characters = 1,
	Poses = 2,
	Styles = 4,
	Expressions = 8,
}

const dependencies = computed({
	get() {
		return (props.json.dependencies as string[]) ?? [];
	},
	set(value: Array<string>) {
		if (value.length === 0) {
			delete props.json.dependencies;
		} else {
			props.json.dependencies = value as [];
		}
	},
});

function classifyChar(char: JSONCharacter): CharClassification {
	if (!char.id.includes(":")) {
		// Does not extend an existing character
		return CharClassification.Characters;
	}
	let ret = 0;
	for (const styleGroup of char.styleGroups ?? []) {
		if (!styleGroup.id.includes(":")) {
			ret |= CharClassification.Styles;
		} else {
			// A style group that extends an existing one can only add poses or styles.
			// And style extensions are hard to detect and rare. TODO
			ret |= CharClassification.Poses;
		}
	}
	if (char.heads && Object.keys(char.heads).length > 0) {
		ret |= CharClassification.Expressions;
	}
	return ret;
}

function updateCharName({
	oldName,
	newName,
}: {
	oldName: string;
	newName: string;
}) {
	if (props.repo.pack.characters) {
		const idx = props.repo.pack.characters.indexOf(oldName);
		if (idx !== -1) {
			props.repo.pack.characters[idx] = newName;
		} else {
			props.repo.pack.characters.push(newName);
		}
	}
}

function addDependency() {}
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
				<fast-tree-item
					@click="createCharacter"
					v-if="!json.characters || json.characters.length === 0"
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
					<fast-tree-item @click="createCharacter"
						>Add character</fast-tree-item
					>
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
			<Button @click="OpenFolder()">Open folder in explorer</Button>
			<PInput label="ID" v-model="repo.pack.id" />
			<PInput label="Name" v-model="repo.pack.name" />
			<PInput label="Source" v-model="repo.pack.source" />
			<PInput label="Description" v-model="repo.pack.description" />
			<Dependencies :dependencies="dependencies" />
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
			@updateCharName="updateCharName"
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
