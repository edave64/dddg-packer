<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { TriggerCoreStateUpdate } from "../wailsjs/go/main/App";
import BreadcrumbsBar from "./components/breadcrumbs-bar.vue";
import { go, useParams } from "./router";
import { bindParams } from "./store/active-pack";
import { dddgPath, initialized } from "./store/core-state";

bindParams();
TriggerCoreStateUpdate();

const route = useRoute();
const router = useRouter();

window.params = useParams();

router.isReady().then(() => {
	watch(
		() => [initialized.value, route.fullPath] as const,
		([init, path]) => {
			if (!init) return;
			if (path !== "/") return;

			if (!dddgPath.value) {
				go("select-dddg");
				return;
			}
			go("select-pack");
		},
		{ immediate: true },
	);
});
</script>

<template>
	<header>
		<BreadcrumbsBar />
	</header>
	<template v-if="!initialized">Starting up...</template>
	<router-view v-else></router-view>
</template>

<style>
#app {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}

header {
	flex-shrink: 0;
}
</style>
