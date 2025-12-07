/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Casts an unknown value to a desired type without runtime checks.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export default function unsafe<T>(value: unknown): T {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	return value as T;
}
