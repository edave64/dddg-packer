<script setup lang="ts">
import CharV1 from "@/components/pack-v1/character.vue";
import CharV2 from "@/components/pack-v2/character.vue";
import { isV2, useActivePack } from "@/store/active-pack";

const pack = useActivePack();
</script>
<template>
	<template v-if="!!pack">
		<CharV1 v-if="!isV2(pack)" />
		<CharV2 v-else />
	</template>
</template>
