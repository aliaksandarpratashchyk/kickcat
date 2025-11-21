/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { MilestoneState } from './MilestoneState';

export interface Milestone {
	description?: string;
	dueDate?: string;
	number?: number;
	state?: MilestoneState;
	title: string;
}
