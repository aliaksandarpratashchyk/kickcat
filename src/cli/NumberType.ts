/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Type } from './Type';

const numberType: Type<number> = {
	parse(raw: string): number {
		const parsed = Number.parseFloat(raw);

		if (Number.isNaN(parsed))
			throw new Error(`Cannot parse "${raw}" as number.`);
		
		return parsed;
	},
	toString(): string {
		return 'number';
	},
};

export default numberType;
