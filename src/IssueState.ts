/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import unsafe from './unsafe';

/**
 * Issue state representing an open issue.
 */
export const OPEN = 'open';

/**
 * Issue state representing a closed issue.
 */
export const CLOSED = 'closed';

/**
 * Union of supported GitHub issue states.
 */
export type IssueState = typeof CLOSED | typeof OPEN;

/**
 * Type guard for checking if a value is a valid issue state.
 */
export function isIssueState(value: unknown): value is IssueState {
	return [CLOSED, OPEN].includes(unsafe(value));
}
