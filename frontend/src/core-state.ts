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
