/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import * as crypto from 'crypto';

/**
 * Produces a stable MD5 hash for JSON-like values by recursively stringifying fields in order.
 */
function hash(value: unknown): string {
	return crypto.createHash('md5').update(stringify(value), 'utf8').digest('hex');
}

function stringify(value: unknown): string {
	if (Array.isArray(value)) return value.map((item) => stringify(item)).join('|');

	if (typeof value === 'object' && value !== null) {
		return (
			Object.keys(value)
				.toSorted()
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				.map((key) => stringify((value as Record<string, unknown>)[key]))
				.join('|')
		);
	}

	if (value === null) return 'null';

	if (typeof value === 'undefined') return '';

	// eslint-disable-next-line @typescript-eslint/no-base-to-string
	return value.toString();
}

export default hash;
