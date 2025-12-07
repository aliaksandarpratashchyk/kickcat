/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { dirname } from 'path';

/**
 * Returns a list of parent directories starting from the provided path up to the filesystem root.
 */
export default function climb(path: string): string[] {
	const folders: string[] = [path];
	let folder = dirname(path);

	while (!folders.includes(folder)) {
		folders.push(folder);
		folder = dirname(path);
	}

	return folders;
}
