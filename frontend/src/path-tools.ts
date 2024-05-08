export function isWebUrl(path: string) {
	return (
		path.startsWith("blob:") ||
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("://")
	);
}

export function joinNormalize(base: string, sub?: string) {
	if (!sub) return base;
	if (sub.startsWith("./")) {
		return `/mountedPack/${sub.slice(2)}`;
	}
	if (sub.startsWith("/")) {
		return `https://edave64.github.io/dddg-assets/v2/${sub.slice(1)}`;
	}
	if (isWebUrl(sub)) return sub;
	return base + sub;
}
