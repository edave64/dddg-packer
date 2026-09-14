<script setup lang="ts">
import InputText from "primevue/inputtext";
import { computed, ref, watch, type PropType } from "vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
	type: {
		type: String as PropType<"any" | "id" | "foreignid">,
		default: "any",
	},
	modelValue: {
		type: String,
		default: "",
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	delayed: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits<{
	"update:modelValue": [string];
}>();

const localValue = ref(props.modelValue);
watch(
	() => props.modelValue,
	(newValue) => {
		localValue.value = newValue;
	},
);

const realValue = computed<string>({
	get(): string {
		return localValue.value;
	},
	set(value: string) {
		if (props.type === "id") {
			value = value.replace(/[^a-z0-9_\-\.]/gi, "");
			value = value.toLowerCase();
		}
		localValue.value = value;
		if (!props.delayed) {
			emit("update:modelValue", value);
		}
	},
});

function delayedResponse() {
	if (props.delayed && localValue.value !== props.modelValue) {
		emit("update:modelValue", localValue.value);
	}
}

const autoComplete = computed(() => {
	if (props.type === "id" || props.type === "foreignid") {
		return "off";
	}
	return undefined;
});
</script>
<template>
	<div style="display: flex; width: calc(100% - 8px); align-items: center">
		<label v-if="label" style="width: 96px" :for="id">{{ label }}</label>
		<InputText
			style="flex-grow: 1"
			type="text"
			:autocomplete="autoComplete"
			:autocapitalize="autoComplete"
			v-model="realValue"
			variant="filled"
			:id
			:placeholder
			:disabled
			@keydown.enter.prevent="delayedResponse"
			@blur="delayedResponse"
		/>
	</div>
</template>
