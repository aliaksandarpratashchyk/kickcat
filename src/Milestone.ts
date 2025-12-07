/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from './Entity';
import type { MilestoneState } from './MilestoneState';

/**
 * GitHub milestone entity schema used by KickCat.
 */
export interface Milestone extends Entity {
	description?: string;
	dueDate?: string;
	number?: number;
	state?: MilestoneState;
	title: string;
}
