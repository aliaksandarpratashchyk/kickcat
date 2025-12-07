/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type } from './Type';

type Union<TTypes extends Type[]> = TTypes extends (infer TType)[]
	? TType extends Type<infer TValue>
		? TValue
		: never
	: never;

/**
 * CLI type that accepts the first successfully parsed value from a list of types.
 */
export default class UnionType<T extends Type[]> implements Type<Union<T>> {
	public readonly types: T;

	constructor(types: T) {
		this.types = types;
	}

	/**
	 * Tries each nested type until one parses the value.
	 */
	parse(value: string): Union<T> {
		for (const type of this.types) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				return type.parse(value) as Union<T>;
			} catch {
				// Do nothing here
			}
		}

		throw new Error(`${value} is invalid for type ${this.toString()}.`);
	}

	toString(): string {
		return this.types.join('|');
	}
}
