<script setup lang="ts">
const props = defineProps({
	obj: {
		type: Object,
	},
});
</script>
<template>
	<details>
		<summary>Code</summary>
		<pre class="code">{{ JSON.stringify(obj, undefined, 2) }}</pre>
	</details>
</template>
<style scoped>
.code {
	font-family: monospace;
	user-select: text;
	-webkit-user-select: text;
	overflow-x: auto;
	width: 100%;
}
</style>
