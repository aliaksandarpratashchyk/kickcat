/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Stringable } from '../Stringable';

/**
 * CLI option type contract that can parse a string and present itself as text.
 */
export interface Type<T = unknown> extends Stringable {
	parse: (value: string) => T;
}

/**
 * Helper to extract the runtime value type from a CLI type.
 */
export type ValueType<TType extends Type> = TType extends Type<infer TValue> ? TValue : never;
