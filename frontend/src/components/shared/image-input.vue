<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
});

const model = defineModel({});
const dlgOpen = ref(false);
</script>
<template>
	<div style="display: flex; align-items: end">
		<fast-text-field
			class="fast-field"
			appearance="filled"
			:placeholder="placeholder ?? label"
			:value="model"
			@input="model = $event.target.value"
			>{{ label }}</fast-text-field
		>
		<fast-button @click="dlgOpen = true">...</fast-button>
	</div>
	<teleport to="#modalSlot" v-if="dlgOpen">
		<fast-dialog>
			<div style="padding: 0 10px 10px; color: var(--neutral-foreground-rest)">
				<h2>Dialog with text and a button.</h2>
				<fast-button @click="dlgOpen = false">Close</fast-button>
			</div>
		</fast-dialog>
	</teleport>
</template>
<style>
.fast-field {
	width: calc(100% - 8px);
}

fast-dialog {
	z-index: 10000;
}
</style>
