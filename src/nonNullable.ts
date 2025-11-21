/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export default function nonNullable<T>(value: T): NonNullable<T> {
	if (typeof value === 'undefined' || value === null) throw new Error(``);

	return value;
}
