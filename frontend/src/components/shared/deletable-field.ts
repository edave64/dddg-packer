import { computed, type WritableComputedRef } from "vue";

/**
 * Since packer aims to produce high-quality output, we like to keep them lean.
 * So we remove fields that use the default value.
 * This function returns a computed value that presents the value as always set, but if the value
 * is set to the default value, it will be deleted transparently.
 *
 * @param obj - A function that returns the object to access the field on. It's a function to allow
 *              it to be reactive.
 * @param key
 * @param defaultValue
 * @returns
 */
export function deletableField<T, K extends keyof T>(
	obj: () => T,
	key: K,
	defaultValue: NonNullable<T[K]>,
): WritableComputedRef<NonNullable<T[K]>> {
	const eql = Array.isArray(defaultValue) ? arrayEquals : Object.is;

	return computed({
		get(): NonNullable<T[K]> {
			return obj()[key] ?? defaultValue;
		},
		set(val: NonNullable<T[K]>) {
			// biome-ignore lint/suspicious/noExplicitAny: Don't know how to make this work with types
			const isDefault = eql(val as any, defaultValue as any);
			if (isDefault && obj()[key] === undefined) return;
			if (val === obj()[key]) return;
			if (isDefault) {
				delete obj()[key];
			} else {
				obj()[key] = val;
			}
		},
	});
}

function arrayEquals<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0, l = a.length; i < l; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
