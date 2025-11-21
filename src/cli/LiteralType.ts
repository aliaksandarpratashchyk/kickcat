/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Type } from './Type';

import isStringable from '../Stringable';

export default class LiteralType<const T extends number | string> implements Type<T> {
	public readonly value: T;

	constructor(value: T) {
		this.value = value;
	}

	parse(value: string): T {
		if (value !== this.value) throw new Error(``);

		return this.value;
	}

	toString(): string {
		return isStringable(this.value) ? this.value.toString() : '';
	}
}
