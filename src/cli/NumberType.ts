/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Type } from './Type';

const numberType: Type<number> = {
	parse(value: string): number {
		return Number.parseFloat(value);
	},
	toString(): string {
		return 'number';
	},
};

export default numberType;
