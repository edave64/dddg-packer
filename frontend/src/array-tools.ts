export function aryMove<T>(ary: T[], from: number, to: number) {
	return ary.splice(to, 0, ary.splice(from, 1)[0]);
}

export function seekFreeIds(prefix: string, list: string[] = []) {
	let i = list.length;
	let ret: string;
	do {
		++i;
		ret = `${prefix}_${i}`;
	} while (list.includes(ret));
	return ret;
}

export function aryRemove<T>(ary: T[] | undefined, value: T) {
	if (!ary) return;
	const index = ary.indexOf(value);
	if (index !== -1) {
		ary.splice(index, 1);
	}
}

export function aryFindRemove<T>(
	ary: T[] | undefined,
	value: (x: T) => boolean,
) {
	if (!ary) return;
	const index = ary.findIndex(value);
	if (index !== -1) {
		ary.splice(index, 1);
	}
}
