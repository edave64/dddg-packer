import type { JSONHeadCollection } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/jsonFormat";
import type { NsfwAbleImg } from "@edave64/doki-doki-dialog-generator-pack-format/dist/v1/model";

export type HeadDummy = Record<
	string,
	JSONHeadCollection | Array<string | NsfwAbleImg>
>;
