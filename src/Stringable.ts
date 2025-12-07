/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Contract for values that can produce a string representation.
 */
export interface Stringable {
	toString: () => string;
}

/**
 * Type guard that checks whether a value implements `toString`.
 */
export default function isStringable(value: unknown): value is Stringable {
	return typeof value !== 'undefined' && value !== null && typeof value.toString === 'function';
}
