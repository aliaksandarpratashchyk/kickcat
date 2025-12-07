/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from './Entity';

/**
 * GitHub label entity schema.
 */
export interface Label extends Entity {
	color: string;
	description?: string;
	name: string;
}
