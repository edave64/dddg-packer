<script setup lang="ts">
import { ref } from "vue";
const props = defineProps({
	obj: {
		type: Object,
	},
});
</script>
<template>
	<details>
		<summary>Code</summary>
		<pre><code>{{ JSON.stringify(obj, undefined, 2) }}</code></pre>
	</details>
</template>
