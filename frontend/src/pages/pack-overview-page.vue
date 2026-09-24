<script setup lang="ts">
import PackV1 from "@/components/pack-v1/pack-v1.vue";
import PackV2 from "@/components/pack-v2/pack-v2.vue";
import { isV2, useActivePack } from "@/store/active-pack";

const pack = useActivePack();
</script>
<template>
	<template v-if="!pack">
		<p>Loading pack...</p>
	</template>
	<PackV2 v-else-if="isV2(pack)" />
	<PackV1 v-else />
</template>
