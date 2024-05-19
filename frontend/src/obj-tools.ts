export function renameKey<T extends {}>(
	obj: T,
	oldKey: keyof T,
	newKey: keyof T,
): T | null {
	// Property already exists! Skip
	if (Object.prototype.hasOwnProperty.call(obj, newKey)) return null;

	// This odd way of manipulating the key is done to preserve the key order. Otherwise, object in
	// the UI that iterate over object keys might jump around strangely
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [
			key === oldKey ? newKey : key,
			value,
		]),
	) as T;
}
