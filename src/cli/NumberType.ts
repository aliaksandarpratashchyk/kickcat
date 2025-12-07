/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type } from './Type';

/**
 * CLI option type that parses numeric values.
 */
const numberType: Type<number> = {
	parse(raw: string): number {
		const parsed = Number.parseFloat(raw);

		if (Number.isNaN(parsed)) throw new Error(`Cannot parse "${raw}" as number.`);

		return parsed;
	},
	toString(): string {
		return 'number';
	},
};

export default numberType;
