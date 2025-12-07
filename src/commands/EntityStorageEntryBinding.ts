/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from '../Entity';
import type EntityStorageEntry from '../EntityStorageEntry';

/**
 * Binding strategy that merges source fields into target.
 */
export const MERGE = 'merge';
/**
 * Binding strategy that fully replaces the target entity.
 */
export const SUBSTITUTE = 'substitute';

/**
 * Strategies for applying source entry changes to a target entry.
 */
export type EntityStorageEntryBindingStrategy = typeof MERGE | typeof SUBSTITUTE;

/**
 * Couples a source and target storage entry with an apply strategy.
 */
export default class EntityStorageEntryBinding<TEntity extends Entity = Entity> {
	readonly source: EntityStorageEntry<TEntity>;
	readonly strategy: EntityStorageEntryBindingStrategy;
	readonly target: EntityStorageEntry<TEntity>;

	constructor(
		target: EntityStorageEntry<TEntity>,
		source: EntityStorageEntry<TEntity>,
		strategy: EntityStorageEntryBindingStrategy = SUBSTITUTE,
	) {
		this.target = target;
		this.source = source;
		this.strategy = strategy;
	}

	/**
	 * Applies the binding strategy to update the target entry.
	 */
	pull(): void {
		if (this.strategy === MERGE) this.target.merge(this.source.entity);
		else this.target.substitute(this.source.entity);
	}
}
