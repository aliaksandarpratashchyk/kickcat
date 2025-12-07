/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import capitalize from './capitalize';
import decapitalize from './decapitalize';

/**
 * Converts a kebab-case identifier into camelCase.
 */
export default function camel(identifier: string): string {
	return decapitalize(identifier.split('-').map(capitalize).join(''));
}
