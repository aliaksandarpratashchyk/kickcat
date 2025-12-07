/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type } from './Type';

const TRUE = ['true', '1', 'yes', 'on'];

const FALSE = ['false', '0', 'no', 'off'];

/**
 * CLI option type that parses common true/false string variants.
 */
const booleanType: Type<boolean> = {
	parse(value: string): boolean {
		if (TRUE.includes(value)) return true;

		if (FALSE.includes(value)) return false;

		throw new Error(`Invalid value for boolean option type.`);
	},
	toString(): string {
		return 'boolean';
	},
};

export default booleanType;
