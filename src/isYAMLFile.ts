/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export default function isYAMLFile(path: string): boolean {
	return path.endsWith('.yml') || path.endsWith('.yaml');
}
