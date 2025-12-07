/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Async factory that returns a promised value.
 */
export type Provider<T> = () => Promise<T>;

/**
 * Memoizes an async provider so the underlying value is fetched only once.
 */
export default function lazy<T>(provider: Provider<T>): Provider<T> {
	let fetched = false;
	let value: null | T = null;
	return async () => {
		if (!fetched) {
			value = await provider();
			// eslint-disable-next-line require-atomic-updates
			fetched = true;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		return value as unknown as T;
	};
}
