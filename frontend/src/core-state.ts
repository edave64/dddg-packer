import { ref } from "vue";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { UploadFile } from "../wailsjs/go/main/App";

export type Stage = "startup" | "selectDDDG" | "selectPack" | "pack";

export interface CoreState {
	dddgPath: string;
	mountedPackPath: string;
}

export const coreState = ref(null as null | CoreState);

EventsOn("coreStateChanged", (newState: CoreState) => {
	coreState.value = newState;
});

export async function saveFile(path: string, data: Blob | Uint8Array | string) {
	const formData = new FormData();

	let normalizedData: Uint8Array;

	if (typeof data === "string") {
		const encoder = new TextEncoder();
		normalizedData = encoder.encode(data);
	} else if (data instanceof Blob) {
		normalizedData = new Uint8Array(await data.arrayBuffer());
	} else {
		normalizedData = data;
	}
	UploadFile(path, Array.from(normalizedData));
}
