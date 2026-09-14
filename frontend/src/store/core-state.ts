import { ref } from "vue";
import { UploadFile } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { usePackId } from "./active-pack";

export const dddgPath = ref("");
export const initialized = ref(false);

EventsOn("coreStateChanged", (newState: { dddgPath: string }) => {
	dddgPath.value = newState.dddgPath;
	initialized.value = true;
});

export async function saveFile(path: string, data: Blob | Uint8Array | string) {
	let normalizedData: Uint8Array;

	if (typeof data === "string") {
		const encoder = new TextEncoder();
		normalizedData = encoder.encode(data);
	} else if (data instanceof Blob) {
		normalizedData = new Uint8Array(await data.arrayBuffer());
	} else {
		normalizedData = data;
	}
	UploadFile(`/${usePackId().value}/${path}`, Array.from(normalizedData));
}
