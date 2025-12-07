/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from './Entity';
import type EntitySchemaRegistry from './EntitySchemaRegistry';
import type { EntityStorageCookie } from './EntityStorageCookie';
import type EntityStorageEntry from './EntityStorageEntry';
import type { EntityType } from './EntityType';

/**
 * Abstraction for reading and writing entity collections.
 */
export interface EntityStorage<
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie,
> {
	/**
	 * Streams all entity entries, optionally filtered by type.
	 */
	all: <TEntity extends Entity>(
		of?: EntityType,
	) => AsyncIterable<EntityStorageEntry<TEntity, TEntityStorageCookie>>;

	/**
	 * Persists all buffered changes.
	 */
	commit: () => Promise<void>;
	readonly entitySchemaRegistry: EntitySchemaRegistry;
	/**
	 * Creates a new entity entry.
	 */
	new: <TEntity extends Entity>(
		of: EntityType,
		entity: TEntity,
	) => Promise<EntityStorageEntry<TEntity, TEntityStorageCookie>>;
	/**
	 * Fetches a single entity entry by type and partial filter.
	 */
	one: <TEntity extends Entity>(
		of: EntityType,
		where: Partial<TEntity>,
	) => Promise<EntityStorageEntry<TEntity, TEntityStorageCookie> | undefined>;
}
