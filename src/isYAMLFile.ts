/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Checks whether a path has a YAML file extension.
 */
export default function isYAMLFile(path: string): boolean {
	return path.endsWith('.yml') || path.endsWith('.yaml');
}
