/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export default function decapitalize(text: string): string {
	if (text.length === 0) return text;

	return text.substring(0, 1).toLocaleLowerCase() + text.substring(1);
}
