<script setup lang="ts">
import MenuTree from "@/components/menu-tree.vue";
import {
	hasChanges,
	save,
	useActivePack,
	useActiveRepo,
} from "@/store/active-pack";
import Button from "primevue/button";
import { RouterView } from "vue-router";

const pack = useActivePack();
const repo = useActiveRepo();
</script>
<template>
	<main>
		<MenuTree id="tree" />
		<p v-if="!repo?.pack">ERROR: No pack in repo file</p>
		<p v-else-if="!repo.pack.dddg1Path && !repo.pack.dddg2Path">
			ERROR: No content pack json referenced in repo.json
		</p>
		<p v-else-if="repo.pack.dddg1Path && repo.pack.dddg2Path">
			ERROR: Multiple content pack jsons referenced in repo.json
		</p>
		<p v-else-if="!pack">No pack</p>
		<div class="pack_wrapper" v-else>
			<RouterView />
		</div>
	</main>
	<footer v-if="hasChanges">
		<Button label="Save changes" @click="save()" />
	</footer>
</template>

<style>
html:has(main) {
	overflow: hidden;
}

#tree {
	width: 384px;
}

main {
	display: flex;
	width: 100%;
	flex-grow: 1;
	overflow: hidden;

	> * {
		height: 100%;
		overflow-y: auto;
		overflow-x: none;
	}
}

main {
	flex-grow: 1;
}

.pack_wrapper {
	width: 100%;
	height: 100%;
	overflow: auto;
	padding: 0 1rem;
}

footer {
	height: 42px;
	padding: 4px;
	flex-shrink: 0;
	background: var(--p-tree-background);
	display: flex;
	justify-content: end;
}
</style>
