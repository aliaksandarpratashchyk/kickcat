/**
 * KickCat v0.4.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "../Entity";
import type EntityStorageEntry from "../EntityStorageEntry";

export const MERGE = 'merge';
export const SUBSTITUTE = 'substitute';

export type EntityStorageEntryBindingStrategy =
    | typeof MERGE
    | typeof SUBSTITUTE;

export default class EntityStorageEntryBinding<TEntity extends Entity = Entity> {
    readonly target: EntityStorageEntry<TEntity>;
    readonly source: EntityStorageEntry<TEntity>;
    readonly strategy: EntityStorageEntryBindingStrategy;

    constructor(
        target: EntityStorageEntry<TEntity>,
        source: EntityStorageEntry<TEntity>,
        strategy: EntityStorageEntryBindingStrategy = SUBSTITUTE
    ) {
        this.target = target;
        this.source = source;
        this.strategy = strategy;
    }

    pull(): void {        
        if (this.strategy === MERGE)
            this.target.merge(this.source.entity);
        else 
            this.target.substitute(this.source.entity);                 
    }
}