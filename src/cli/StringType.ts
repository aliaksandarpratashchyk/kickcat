/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Type } from './Type';

const stringType: Type<string> = {
	parse(value: string): string {
		return value;
	},
	toString(): string {
		return 'string';
	},
};

export default stringType;
