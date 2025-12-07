/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import unsafe from './unsafe';

/**
 * Returns a shallow copy of a record without the specified property key.
 */
export function omit<T extends Record<string, unknown> = Record<string, unknown>>(
	record: T,
	propertyName: string,
): T {
	return unsafe(Object.fromEntries(Object.entries(record).filter(([key]) => key !== propertyName)));
}
