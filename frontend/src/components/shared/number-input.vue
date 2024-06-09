<script setup lang="ts">
import InputNumber from "primevue/inputnumber";
import { getCurrentInstance, ref } from "vue";

const props = defineProps({
	label: {
		type: String,
	},
	placeholder: {
		type: String,
	},
});

const model = defineModel({ type: Number });

const id = ref(
	(
		getCurrentInstance()?.uid ?? Math.random() * Number.MAX_SAFE_INTEGER
	).toString(),
);
</script>
<template>
	<InputNumber style="width: 100%" v-model="model" :id :placeholder />
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

.p-inputnumber,
input {
	width: 100%;
}
</style>
