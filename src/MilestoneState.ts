/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Milestone state representing an open milestone.
 */
export const OPEN = 'open';

/**
 * Milestone state representing a closed milestone.
 */
export const CLOSED = 'closed';

/**
 * Union of supported GitHub milestone states.
 */
export type MilestoneState = typeof CLOSED | typeof OPEN;
