/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from './Entity';
import type { IssueState } from './IssueState';

/**
 * GitHub issue entity schema used by KickCat.
 */
export interface Issue extends Entity {
	dependencies?: (number | string)[];
	description?: string;
	labels?: string[];
	milestone?: number | string;
	number?: number;
	state?: IssueState;
	title: string;
}
