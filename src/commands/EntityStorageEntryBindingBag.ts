/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from '../Entity';
import type EntityStorageEntryBinding from './EntityStorageEntryBinding';

/**
 * Helper collection for applying multiple entry bindings.
 */
export default class EntityStorageEntryBindingBag<TEntity extends Entity = Entity> {
	/**
	 * Returns the queued bindings.
	 */
	get bindings(): readonly EntityStorageEntryBinding<TEntity>[] {
		return this.#bindings;
	}

	readonly #bindings: EntityStorageEntryBinding<TEntity>[] = [];

	/**
	 * Adds a binding to the bag.
	 */
	add(binding: EntityStorageEntryBinding<TEntity>): void {
		this.#bindings.push(binding);
	}

	/**
	 * Applies all bindings in order.
	 */
	pullAll(): void {
		for (const binding of this.#bindings) binding.pull();
	}
}
