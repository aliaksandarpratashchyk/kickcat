/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "./Entity";
import type { EntityStorageCookie } from "./EntityStorageCookie";
import type EntityStorageEntry from "./EntityStorageEntry";
import type { EntityType } from "./EntityType";

export interface EntityStorage<
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie> {

    one: <TEntity extends Entity>(of: EntityType, where: Partial<TEntity>) => 
		Promise<EntityStorageEntry<TEntity, TEntityStorageCookie> | undefined>;    
	all: <TEntity extends Entity>(of?: EntityType) =>
		AsyncIterable<EntityStorageEntry<TEntity, TEntityStorageCookie>>;
	new: <TEntity extends Entity>(of: EntityType, entity: TEntity) => 
		Promise<EntityStorageEntry<TEntity, TEntityStorageCookie>>;
    commit: () => Promise<void>;
}