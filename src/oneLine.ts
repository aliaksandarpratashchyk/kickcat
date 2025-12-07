/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

const NEWLINE_REGEXP = /(?:\r|\n|\r\n)+/gu;

/**
 * Replaces all newline characters in a string with a single space.
 */
export default function oneLine(text: string): string {
	return text.replaceAll(NEWLINE_REGEXP, ' ');
}
