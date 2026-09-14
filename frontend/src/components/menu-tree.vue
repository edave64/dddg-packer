<script setup lang="ts">
import Tree from "primevue/tree";
import type { TreeNode } from "primevue/treenode";
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
	const matched = route.matched;
	let currentItem = matched.at(-1);
	const parentItem = matched.at(-2);
	if (currentItem?.path === "" || currentItem?.path === parentItem?.path)
		currentItem = parentItem;
	if (!currentItem) return [];

	const items: TreeNode[] = [];

	let namedItems = 0;
	let lastPath: string | undefined = undefined;
	for (let i = matched.length - 1; i >= 0; i--) {
		let item: RouteLocationMatched | RouteRecordRaw = matched[i];
		if (item.path === lastPath) continue;
		lastPath = item.path;
		const indexChild = item.children?.find((y) => y.path === "");
		if (indexChild) item = indexChild;
		if (item.name) namedItems++;
		if (namedItems > 1) {
			items.push({
				key: item.path,
				leaf: true,
				selectable: true,
				label: `Back to ${getLabelOf(item)}`,
				command: () => router.push({ name: item.name, params: route.params }),
			});
			break;
		}
	}

	for (const child of currentItem.children) {
		if (!child.meta?.header) continue;
		const add = child.meta.add as string | undefined;
		const doAddChild = child.meta.doAddChild as (id?: string) => void;
		const canAddChildren =
			(child.meta.canAddChildren as () => boolean)?.() ?? !!doAddChild;

		console.log(`key: ${child.path} canAddChildren: ${canAddChildren}`);
		const children =
			(child.meta.children as (addFunction: any) => TreeNode[])?.(
				child.meta.doAddChild,
			) ?? [];
		if (children.length === 0) {
			if (add && canAddChildren) {
				items.push({
					key: child.path,
					label: add,
					command: () => doAddChild(),
				});
			}
		} else {
			const item: TreeNode = {
				key: child.path,
				label: child.meta.header as string,
				leaf: false,
				selectable: false,
				children: children.map((x) => ({
					...x,
					key: child.path + "/" + x.key,
				})),
			};
			if (add && canAddChildren) {
				item.children!.push({
					key: child.path,
					label: add,
					command: () => doAddChild(),
				});
			}
			items.push(item);
		}
	}

	return items;
});

function getLabelOf(path: RouteLocationMatched | RouteRecordRaw) {
	const title = path.meta?.title;
	if (typeof title === "function") return title();
	return title ?? path.name;
}
</script>
<template>
	<Tree
		class="menu-tree"
		:value="items"
		selectionMode="single"
		:expanded-keys="Object.fromEntries(items.map((x) => [x.key, true]))"
		@click.prevent
		@node-select="$event.command?.()"
	/>
</template>
<style lang="css" scoped>
.menu-tree {
	--p-tree-node-gap: 0;
	--p-tree-indent: 1rem;
	--p-tree-padding: 0;
}

.menu-tree::v-deep(.p-tree-node-toggle-button) {
	display: none;
}
</style>
