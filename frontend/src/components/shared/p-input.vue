<script setup lang="ts">
import InputText from "primevue/inputtext";
import { computed, getCurrentInstance, ref, watch, type PropType } from "vue";

const props = defineProps({
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
});

const emit = defineEmits<{
	"update:modelValue": [string];
}>();

const id = ref(
	(
		getCurrentInstance()?.uid ?? Math.random() * Number.MAX_SAFE_INTEGER
	).toString(),
);

const invalid = ref(false);
const error = ref("");
const temp_val = ref(props.modelValue);

watch(
	() => props.modelValue,
	(newValue) => {
		updateValue(props.modelValue);
	},
	{ immediate: true },
);

const realValue = computed<string>({
	get(): string {
		return props.modelValue;
	},
	set(value: string) {
		if (props.type === "id") {
			value = value.replace(/[^a-z0-9_\-\.]/gi, "");
			value = value.toLowerCase();
		}
		emit("update:modelValue", value);
	},
});

function updateValue(value: string | undefined) {
	if (props.disabled) return;
	if (value == null) {
		invalid.value = true;
		return;
	}
	temp_val.value = value;
	if (props.type === "id") {
		if (value === "") {
			invalid.value = false;
			error.value = "";
			return;
		}
		if (!value.match(/^[a-z0-9_\-\.]+$/)) {
			invalid.value = true;
			error.value =
				"IDs can only contain lowercase letters, numbers, underscores, dots and dashes";
			return;
		}
		if (!value.match(/^[a-z]/)) {
			invalid.value = true;
			error.value = "IDs must start with a letter";
			return;
		}
		invalid.value = false;
		error.value = "";
		emit("update:modelValue", value);
	} else {
		emit("update:modelValue", value ?? "");
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
			:invalid
			:placeholder
			:disabled
		/>
	</div>
	<p v-if="invalid" style="color: red">{{ error }}</p>
</template>
