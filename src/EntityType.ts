/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import LiteralType from './cli/LiteralType';
import UnionType from './cli/UnionType';
import unsafe from './unsafe';

/**
 * Entity type representing GitHub milestones.
 */
export const MILESTONE = 'milestone';
/**
 * Entity type representing GitHub labels.
 */
export const LABEL = 'label';
/**
 * Entity type representing GitHub issues.
 */
export const ISSUE = 'issue';

/**
 * Union of all supported entity types.
 */
export type EntityType = typeof ISSUE | typeof LABEL | typeof MILESTONE;

/**
 * KickCat CLI type definition for entity type parameters.
 */
export const entityTypeType = new UnionType([
	new LiteralType(MILESTONE),
	new LiteralType(LABEL),
	new LiteralType(ISSUE),
]);

/**
 * Type guard for checking if a value is a supported entity type.
 */
export function isEntityType(value: unknown): value is EntityType {
	return [ISSUE, LABEL, MILESTONE].includes(unsafe(value));
}
