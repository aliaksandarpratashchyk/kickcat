/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export default function kebab(identifier: string): string {
	return (
		identifier
			// eslint-disable-next-line prefer-named-capture-group
			.replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
			// eslint-disable-next-line prefer-named-capture-group
			.replace(/([A-Z])([A-Z][a-z])/gu, '$1-$2')
			.toLowerCase()
	);
}
