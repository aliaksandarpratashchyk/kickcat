/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export interface Stringable {
	toString: () => string;
}

export default function isStringable(value: unknown): value is Stringable {
	return typeof value !== 'undefined' && value !== null && typeof value.toString === 'function';
}
