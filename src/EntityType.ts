/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import LiteralType from "./cli/LiteralType";
import UnionType from "./cli/UnionType";
import unsafe from "./unsafe";

export const MILESTONE = 'milestone';
export const LABEL = 'label';
export const ISSUE = 'issue';

export type EntityType = typeof MILESTONE | typeof LABEL | typeof ISSUE;

export const entityTypeType = new UnionType([
    new LiteralType(MILESTONE),
    new LiteralType(LABEL),
    new LiteralType(ISSUE)
]);

export function isEntityType(value: unknown): value is EntityType {
    return [ MILESTONE, LABEL, ISSUE ].includes(unsafe(value));
}