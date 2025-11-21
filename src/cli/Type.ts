/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Stringable } from '../Stringable';

export interface Type<T = unknown> extends Stringable {
	parse: (value: string) => T;
}

export type ValueType<TType extends Type> = TType extends Type<infer TValue> ? TValue : never;
