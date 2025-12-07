/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { access } from 'fs/promises';

/**
 * Checks whether a path is accessible on disk.
 */
export async function exists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch (error) {
		if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT')
			return false;

		throw new Error(`Error checking file '${path}'.`, { cause: error });
	}
}
