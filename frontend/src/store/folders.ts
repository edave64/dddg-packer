import { joinNormalize } from "@/path-tools";
import { computed } from "vue";
import {
	useActivePack,
	useBackground,
	useCharacter,
	useHeadGroup,
	useHeadGroupV1,
	usePose,
	useSprite,
	useStyle,
	useStyleGroup,
} from "./active-pack";

function join(base: string, path: string | undefined): string {
	const pack = useActivePack().value;
	if (!pack) return "";
	return joinNormalize(pack.packId!, base, path);
}

export const packFolder = computed(() => {
	const pack = useActivePack();
	if (!pack) return "";
	const base = join("", "./");
	return join(base, pack.value?.folder);
});

export const characterFolder = computed(() => {
	const base = packFolder.value;
	// In v1 packs, the character folder is the same as the pack folder
	const char = useCharacter().value;
	if (!char) return base;
	return join(base, char.folder);
});

export const headGroupFolder = computed(() => {
	const base = characterFolder.value;
	const headGroup = useHeadGroup().value || useHeadGroupV1().value;
	if (!headGroup) return base;
	return join(base, headGroup.folder);
});

export const styleGroupFolder = computed(() => {
	const base = characterFolder.value;
	const styleGroup = useStyleGroup().value;
	if (!styleGroup) return base;
	return join(base, styleGroup.folder);
});

export const styleFolder = computed(() => {
	const base = styleGroupFolder.value;
	const style = useStyle().value;
	if (!style) return base;
	return join(base, style.folder);
});

export const poseFolder = computed(() => {
	const base = styleFolder.value;
	const pose = usePose().value;
	if (!pose) return base;
	return join(base, pose.folder);
});

export const backgroundFolder = computed(() => {
	const base = packFolder.value;
	const background = useBackground().value;
	if (!background) return base;
	return join(base, background.folder);
});

export const spriteFolder = computed(() => {
	const base = backgroundFolder.value;
	const sprite = useSprite().value;
	if (!sprite) return base;
	return join(base, sprite.folder);
});
