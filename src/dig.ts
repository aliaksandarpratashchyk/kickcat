/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

import { exists } from './exists';

/**
 * Recursively returns all files under a path. If the path is a file, returns it.
 */
export default async function dig(path: string): Promise<string[]> {
	if (!(await exists(path))) return [];

	const stats = await stat(path);

	if (stats.isFile()) return [path];

	let filesAndFolders: string[] = [];

	try {
		const entries = await readdir(path, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(path, entry.name);

			if (entry.isDirectory()) {
				// If it's a directory, recursively call the function
				// eslint-disable-next-line no-await-in-loop
				const subEntries = await dig(fullPath);
				filesAndFolders = filesAndFolders.concat(subEntries);
			} else if (entry.isFile()) {
				// If it's a file, add its full path
				filesAndFolders.push(fullPath);
			}
		}
	} catch (error) {
		throw new Error(`Error reading "${path}".`, { cause: error });
	}

	return filesAndFolders;
}
