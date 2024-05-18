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
