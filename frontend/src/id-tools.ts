export function normalizeId(str: string) {
	return str
		.toLocaleLowerCase()
		.replace(/ /g, "_")
		.replace(/[^a-z0-9\-_\.]/g, "");
}
