/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type } from './Type';

/**
 * CLI option type that returns raw string values.
 */
const stringType: Type<string> = {
	parse(value: string): string {
		return value;
	},
	toString(): string {
		return 'string';
	},
};

export default stringType;
