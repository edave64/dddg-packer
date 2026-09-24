<script setup lang="ts">
import Breadcrumb from "primevue/breadcrumb";
import type { MenuItem } from "primevue/menuitem";
import { computed } from "vue";
import {
	useRoute,
	useRouter,
	type RouteLocationMatched,
	type RouteRecordRaw,
} from "vue-router";

const router = useRouter();
const route = useRoute();
const items = computed(() => {
	return route.matched
		.map((x, i, matched) => {
			const isLast = i === matched.length - 1;
			if (!x.name) {
				const indexChild = x.children?.find((y) => y.path === "");
				if (
					indexChild?.name &&
					matched[i + 1]?.name !== indexChild.name
				) {
					const command = isLast
						? undefined
						: () =>
								router.push({
									name: indexChild.name,
									params: route.params,
								});
					return {
						label: getLabelOf(indexChild),
						command,
					} as MenuItem;
				}
				return null;
			}
			const command = isLast
				? undefined
				: () => router.push({ name: x.name, params: route.params });
			return {
				label: getLabelOf(x),
				command,
			} as MenuItem;
		})
		.filter((x): x is MenuItem => !!x);
});

function getLabelOf(path: RouteLocationMatched | RouteRecordRaw) {
	const title = path.meta?.title;
	if (typeof title === "function") return title();
	return title ?? path.name;
}
</script>
<template>
	<Breadcrumb :model="items" @click.prevent />
</template>
