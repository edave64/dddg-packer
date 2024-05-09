import { ref } from "vue";
import { EventsOn } from "../wailsjs/runtime/runtime";

export type Stage = "startup" | "selectDDDG" | "selectPack" | "pack";

export interface CoreState {
	dddgPath: string;
	mountedPackPath: string;
}

export const coreState = ref(null as null | CoreState);

EventsOn("coreStateChanged", (newState: CoreState) => {
	coreState.value = newState;
});

export async function saveFile(path: string, data: Blob | string) {
	const formData = new FormData();

	let normalizedData: Blob;

	if (typeof data === "string") {
		const encoder = new TextEncoder();
		normalizedData = new File([encoder.encode(data)], "data", {
			type: "text/json",
		});
	} else {
		normalizedData = data;
	}

	formData.append("data", normalizedData);
	await fetch(`/mountedPack/${path}`, {
		method: "PUT",
		body: formData,
	});
}
