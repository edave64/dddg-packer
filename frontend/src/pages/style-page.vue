<script setup lang="ts">
import Code from "@/components/shared/code.vue";
import { useStyle } from "@/store/active-pack";
import { computed } from "vue";

const style = useStyle();

const isExtension = computed(() => {
	return false;
});
</script>
<template>
	<template v-if="style">
		<h2>Style {{ isExtension ? "extension" : "" }}</h2>
		<Code :obj="style" />
	</template>
</template>
