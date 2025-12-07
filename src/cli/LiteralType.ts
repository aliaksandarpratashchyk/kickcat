/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type } from './Type';

import isStringable from '../Stringable';

/**
 * CLI type that matches exactly one literal string or number.
 */
export default class LiteralType<const T extends number | string> implements Type<T> {
	public readonly value: T;

	constructor(value: T) {
		this.value = value;
	}

	/**
	 * Returns the literal when the input matches; otherwise throws.
	 */
	parse(value: string): T {
		if (value !== this.value) throw new Error(``);

		return this.value;
	}

	toString(): string {
		return isStringable(this.value) ? this.value.toString() : '';
	}
}
