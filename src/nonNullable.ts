/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Narrows a value by asserting it is neither `null` nor `undefined`.
 * Throws if the value is nullish.
 */
export default function nonNullable<T>(value: T): NonNullable<T> {
	if (typeof value === 'undefined' || value === null)
		throw new Error(`Expected value to be non-nullable, got ${value === null ? 'null' : 'undefined'}.`);

	return value;
}
