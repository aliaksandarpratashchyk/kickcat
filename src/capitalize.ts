/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Uppercases the first character of a string, leaving the rest untouched.
 */
export default function capitalize(text: string): string {
	if (text.length === 0) return text;

	return text.substring(0, 1).toLocaleUpperCase() + text.substring(1);
}
