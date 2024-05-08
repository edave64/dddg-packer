export type Stage = "startup" | "selectDDDG" | "selectPack" | "pack";

export interface CoreState {
	dddgPath: string;
	mountedPackPath: string;
}
