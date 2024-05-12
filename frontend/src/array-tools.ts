export function aryMove<T>(ary: T[], from: number, to: number) {
	return ary.splice(to, 0, ary.splice(from, 1)[0]);
}
