<script setup lang="ts">
import InputText from "primevue/inputtext";
import { getCurrentInstance, ref, watch, type PropType } from "vue";

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
	type: {
		type: String as PropType<"any" | "id">,
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

function updateValue(value: string | undefined) {
	if (props.disabled) return;
	if (value == null) {
		invalid.value = true;
		return;
	}
	temp_val.value = value;
	if (props.type === "id") {
		if (!value.match(/^[a-z]/)) {
			invalid.value = true;
			error.value = "IDs must start with a letter";
			return;
		}
		if (!value.match(/^[a-z0-9_\-\.]+$/)) {
			invalid.value = true;
			error.value =
				"IDs can only contain lowercase letters, numbers, underscores, dots and dashes";
			return;
		}
		invalid.value = false;
		error.value = "";
		emit("update:modelValue", value);
	} else {
		emit("update:modelValue", value ?? "");
	}
}
</script>
<template>
	<div style="display: flex; width: calc(100% - 8px); align-items: center">
		<label v-if="label" style="width: 96px" :for="id">{{ label }}</label>
		<InputText
			style="flex-grow: 1"
			type="text"
			:autocomplete="type === 'id' ? 'off' : undefined"
			:aria-autocomplete="type === 'id' ? 'none' : undefined"
			:value="temp_val"
			@update:modelValue="updateValue($event)"
			variant="filled"
			:id
			:invalid
			:placeholder
			:disabled
		/>
	</div>
	<p v-if="invalid" style="color: red">{{ error }}</p>
</template>
