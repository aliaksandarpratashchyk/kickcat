/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import capitalize from './capitalize';
import decapitalize from './decapitalize';

export default function camel(identifier: string): string {
	return decapitalize(identifier.split('-').map(capitalize).join(''));
}
