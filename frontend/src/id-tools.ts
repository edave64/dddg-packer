export function normalizeId(str: string) {
	return str
		.toLocaleLowerCase()
		.replace(/ /g, "_")
		.replace(/[^a-z0-9\-_\.]/g, "");
}

export function seekById<T extends { id: string }>(
	id: string,
	list: Array<T> | undefined,
): T | undefined {
	if (!list) return undefined;
	return list.find((x) => x.id === id);
}
