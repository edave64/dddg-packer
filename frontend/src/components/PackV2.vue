<script setup lang="ts">
import { computed, ref, watch, type PropType } from "vue";
import {
	type JSONBackground,
	type JSONCharacter,
	type JSONColor,
	type JSONHeadCollection,
	type JSONPose,
	type JSONSprite,
	type JSONStyle,
	type JSONStyleGroup,
	type JSONContentPack as V2Json,
} from "@edave64/doki-doki-dialog-generator-pack-format/dist/v2/jsonFormat";
import Sprites from "./PackV2/Sprites.vue";
import Character from "./PackV2/character.vue";
import HeadGroup from "./PackV2/head-group.vue";
import StyleGroup from "./PackV2/style-group.vue";
import Style from "./PackV2/style.vue";
import Pose from "./PackV2/pose.vue";
import { joinNormalize } from "../path-tools";

const props = defineProps({
	json: {
		required: true,
		type: Object as PropType<V2Json>,
	},
});

const root = joinNormalize("", "./");
const folder = computed(() => {
	return joinNormalize(root, props.json.folder);
});

const selectedObj = ref(null as null | Selected);

function updateHeadkey(oldKey: string, newKey: string) {
	if (selectedObj.value?.t !== "head-group") return;
	if (selectedObj.value.parent[newKey]) return;
	selectedObj.value.parent[newKey] = selectedObj.value.obj;
	selectedObj.value.key = newKey;
	delete selectedObj.value.parent[oldKey];
}

type Selected =
	| {
			t: "char";
			obj: JSONCharacter;
	  }
	| {
			t: "head-group";
			obj: JSONHeadCollection | string[][];
			key: string;
			parent: Exclude<JSONCharacter["heads"], undefined>;
	  }
	| {
			t: "style-group";
			obj: JSONStyleGroup;
	  }
	| {
			t: "style";
			obj: JSONStyle;
	  }
	| {
			t: "pose";
			obj: JSONPose;
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
</script>
<template>
	<div class="pack_wrapper">
		<ul class="pack_tree">
			<li v-if="json.characters && json.characters.length > 0">
				Characters
				<ul>
					<li v-for="char in json.characters!" :key="'char:' + char.id">
						<a href="#" @click="selectedObj = { t: 'char', obj: char }">{{
							char.label ? `${char.label} [${char.id}]` : char.id
						}}</a>
						<ul>
							<li v-if="char.heads && Object.keys(char.heads).length > 0">
								Heads
								<ul>
									<li v-for="(v, k) of char.heads" :key="'head:' + k">
										<a
											href="#"
											@click="
												selectedObj = {
													t: 'head-group',
													obj: v,
													key: k as string,
													parent: char.heads,
												}
											"
											>{{ k }}</a
										>
									</li>
								</ul>
							</li>
							<li v-if="char.styleGroups && char.styleGroups.length > 0">
								Style groups
								<ul>
									<li v-for="sg of char.styleGroups" :key="'sg:' + sg.id">
										<a
											href="#"
											@click="selectedObj = { t: 'style-group', obj: sg }"
											>{{ sg.id }}</a
										>
										<ul>
											<li
												v-for="s of sg.styles"
												:key="
													'sg:' + sg.id + 's:' + JSON.stringify(s.components)
												"
											>
												<a
													href="#"
													@click="selectedObj = { t: 'style', obj: s }"
													>{{
														s.components
															? JSON.stringify(s.components)
															: "default"
													}}</a
												>
												<ul
													v-for="pose of s.poses"
													:key="
														'sg:' +
														sg.id +
														's:' +
														JSON.stringify(s.components) +
														'p:' +
														pose.id
													"
												>
													<li>
														<a
															href="#"
															@click="selectedObj = { t: 'pose', obj: pose }"
															>{{ pose.id }}</a
														>
													</li>
												</ul>
											</li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</li>
					<li>Add new character</li>
				</ul>
			</li>
			<li v-if="json.sprites && json.sprites.length > 0">
				Sprites
				<ul>
					<li v-for="sprite in json.sprites!" :key="sprite.id">
						<a href="#" @click="selectedObj = { t: 'sprite', obj: sprite }">{{
							sprite.label ? `${sprite.label} [${sprite.id}]` : sprite.id
						}}</a>
					</li>
					<li>Add new sprite</li>
				</ul>
			</li>
			<li v-if="json.backgrounds && json.backgrounds.length > 0">
				Backgrounds
				<ul>
					<li v-for="bg in json.backgrounds!" :key="bg.id">
						{{ bg.label ?? bg.id }}
					</li>
				</ul>
			</li>
			<li v-if="json.colors && json.colors.length > 0">
				Colors
				<ul>
					<li v-for="color in json.colors!" :key="color.color">
						{{ color.label ?? color.color }}
					</li>
				</ul>
			</li>
			<li v-if="!json.characters || json.characters.length === 0">
				Add new character
			</li>
			<li v-if="!json.sprites || json.sprites.length === 0">Add new sprite</li>
			<li v-if="!json.backgrounds || json.backgrounds.length === 0">
				Add new background
			</li>
			<li v-if="!json.colors || json.colors.length === 0">Add new color</li>
		</ul>
		<div class="pack_editor">
			<Sprites
				:sprite="selectedObj.obj"
				:folder="folder"
				v-if="selectedObj && selectedObj.t === 'sprite'"
			/>
			<Character
				:char="selectedObj.obj"
				:folder="folder"
				v-else-if="selectedObj && selectedObj.t === 'char'"
			/>
			<HeadGroup
				:head-group="selectedObj.obj"
				:folder="folder"
				:id="selectedObj.key"
				@update-key="updateHeadkey(selectedObj.key, $event)"
				v-else-if="selectedObj && selectedObj.t === 'head-group'"
			/>
			<StyleGroup
				:style-group="selectedObj.obj"
				:folder="folder"
				v-else-if="selectedObj && selectedObj.t === 'style-group'"
			/>
			<Style
				:style="selectedObj.obj"
				:folder="folder"
				v-else-if="selectedObj && selectedObj.t === 'style'"
			/>
			<Pose
				:pose="selectedObj.obj"
				:folder="folder"
				v-else-if="selectedObj && selectedObj.t === 'pose'"
			/>
			<template v-else>
				{{ selectedObj?.t }}
				<p>
					{{ JSON.stringify(selectedObj?.obj) }}
				</p>
			</template>
		</div>
	</div>
</template>
<style>
.pack_wrapper {
	display: flex;
	width: 100%;
	gap: 1rem;
}

.pack_editor {
	flex-grow: 1;
}
</style>
