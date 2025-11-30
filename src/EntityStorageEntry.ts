/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "./Entity";
import type { EntityStorageCookie } from "./EntityStorageCookie";
import type { EntityType } from "./EntityType";

export const DETACHED = 'detached';
export const NEW = 'new';
export const CLEAN = 'clean';
export const DIRTY = 'dirty';
export const KILLED = 'killed';

export interface EntityStorageEntryConfiguration<
	TEntity extends Entity = Entity,
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie> {	

	type: EntityType;
	entity: TEntity;
	hash?: string;		
	cookie: TEntityStorageCookie;
	state?: EntityStorageEntryState;
}

export type EntityStorageEntryState =
	| typeof CLEAN
	| typeof DIRTY
	| typeof DETACHED
	| typeof KILLED
	| typeof NEW;

export default class EntityStorageEntry<
	TEntity extends Entity = Entity,
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie> {		

	readonly type: EntityType;
	readonly hash?: string;	
	readonly cookie: TEntityStorageCookie;
	get entity(): TEntity {
		return this.#entity;
	}
	get state(): EntityStorageEntryState {
		return this.#state;
	}

	#entity: TEntity;

	#state: EntityStorageEntryState;

	constructor({ 
		type,
		entity, 
		hash, 
		state, 
		cookie 
	}: EntityStorageEntryConfiguration<TEntity, TEntityStorageCookie>) {

		this.type = type;
		this.#entity = Object.freeze({ ...entity });
		this.hash = hash;				
		this.cookie = cookie;
		this.#state = state ?? DETACHED;
	}

	change(entity: Partial<TEntity>): this {
		if (![ CLEAN, DIRTY ].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be changed.`);

		this.#entity = Object.freeze({ ...this.entity, ...entity });
		this.#state = DIRTY;	
		
		return this;
	}

	delete(): this {
		if (![ CLEAN, DIRTY, KILLED ].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be killed.`);

		this.#state = KILLED;	
		
		return this;
	}	
}
