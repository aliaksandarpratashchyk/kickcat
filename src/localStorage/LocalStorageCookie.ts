/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { EntityStorageCookie } from '../EntityStorageCookie';
import type LocalStorageFile from './LocalStorageFile';

/**
 * Metadata describing where a local entry is stored.
 */
export interface LocalStorageCookie extends EntityStorageCookie {
	file: LocalStorageFile;
	index?: number;
}
