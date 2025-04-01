export function randNumberInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function lerp(a: number, b: number, t: number): number {
	return a + t * (b - a);
}
