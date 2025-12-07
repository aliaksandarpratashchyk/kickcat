/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { isArray, isNull, isNumber, isString, isUndefined, uniq } from 'underscore';

import type { Entity } from './Entity';
import type EntitySchema from './EntitySchema';
import type { EntityStorage } from './EntityStorage';
import type { EntityStorageCookie } from './EntityStorageCookie';

import { omit } from './omit';
import unsafe from './unsafe';

/**
 * Entry state indicating it is not attached to storage.
 */
export const DETACHED = 'detached';
/**
 * Entry state indicating it was newly created.
 */
export const NEW = 'new';
/**
 * Entry state indicating no changes are pending.
 */
export const CLEAN = 'clean';
/**
 * Entry state indicating the entity has been modified.
 */
export const DIRTY = 'dirty';
/**
 * Entry state indicating the entity is marked for deletion.
 */
export const KILLED = 'killed';

/**
 * Configuration for creating an `EntityStorageEntry`.
 */
export interface EntityStorageEntryConfiguration<
	TEntity extends Entity = Entity,
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie,
> {
	cookie: TEntityStorageCookie;
	entity: TEntity;
	hash?: string;
	schema: EntitySchema<TEntity>;
	state?: EntityStorageEntryState;
	storage: EntityStorage<TEntityStorageCookie>;
}

/**
 * Allowed lifecycle states of an entity storage entry.
 */
export type EntityStorageEntryState =
	| typeof CLEAN
	| typeof DETACHED
	| typeof DIRTY
	| typeof KILLED
	| typeof NEW;

/**
 * Wrapper around an entity instance tracked by a storage implementation.
 */
export default class EntityStorageEntry<
	TEntity extends Entity = Entity,
	TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie,
> {
	readonly cookie: TEntityStorageCookie;
	hash?: string;
	preserveHash = false;
	readonly schema: EntitySchema<TEntity>;
	readonly storage: EntityStorage<TEntityStorageCookie>;
	get entity(): TEntity {
		return this.#entity;
	}

	/**
	 * Returns values of "new unique" properties present on the entity.
	 */
	get newUniqueKeys(): (number | string)[] {
		const keys: (number | string)[] = [];

		for (const newUniqueKey of this.schema.newUniqueProperties) {
			const value = this.#entity[newUniqueKey];
			if (typeof value === 'number' || typeof value === 'string') keys.push(value);
		}

		return keys;
	}

	get notHasPrimaryKey(): boolean {
		return this.primaryKey === null;
	}
	/**
	 * Returns the best unique identifier available (primary, then unique, then new unique).
	 */
	get preferredUniqueKey(): null | number | string {
		const primaryKey = this.primaryKey;
		if (primaryKey !== null) return primaryKey;

		const uniqueKeys = this.uniqueKeys;
		if (uniqueKeys.length > 0) return uniqueKeys[0] ?? null;

		const newUniqueKeys = this.newUniqueKeys;
		if (newUniqueKeys.length > 0) return newUniqueKeys[0] ?? null;

		return null;
	}

	/**
	 * Returns the primary key value if present, otherwise null.
	 */
	get primaryKey(): null | number | string {
		for (const [propertyName, propertySchema] of Object.entries(this.schema.properties)) {
			if (propertySchema.primaryKey) {
				const value = this.#entity[propertyName];
				if (typeof value === 'number' || typeof value === 'string') return value;
			}
		}

		return null;
	}

	get state(): EntityStorageEntryState {
		return this.#state;
	}

	/**
	 * Returns values of unique properties present on the entity.
	 */
	get uniqueKeys(): (number | string)[] {
		const keys: (number | string)[] = [];

		for (const uniqueKey of this.schema.uniqueProperties) {
			const value = this.#entity[uniqueKey];
			if (typeof value === 'number' || typeof value === 'string') keys.push(value);
		}

		return keys;
	}

	#entity: TEntity;

	#state: EntityStorageEntryState;

	constructor({
		cookie,
		entity,
		hash,
		schema,
		state,
		storage,
	}: EntityStorageEntryConfiguration<TEntity, TEntityStorageCookie>) {
		this.schema = schema;
		this.#entity = Object.freeze({ ...entity });
		this.hash = hash;
		this.cookie = cookie;
		this.#state = state ?? DETACHED;
		this.storage = storage;
	}

	/**
	 * Sets the tracked entity and marks it clean.
	 */
	clean(entity: TEntity): this {
		if (![CLEAN, DIRTY, NEW].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be changed.`);

		this.#entity = Object.freeze({ ...entity });
		this.#state = CLEAN;

		return this;
	}

	/**
	 * Marks the entry as deleted.
	 */
	delete(): this {
		if (![CLEAN, DIRTY, KILLED].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be killed.`);

		this.#state = KILLED;

		return this;
	}

	/**
	 * Removes references to the provided entry from this entity.
	 */
	// eslint-disable-next-line max-lines-per-function, max-statements
	freeOf(entry: EntityStorageEntry): this {
		if (![CLEAN, DIRTY].includes(this.#state)) return this;

		if (!this.schema.references.includes(entry.schema.type)) return this;

		for (const [propertyName, property] of Object.entries(this.schema.properties)) {
			if (property.reference === entry.schema.type) {
				if (Array.isArray(this.#entity[propertyName])) {
					const dependency = this.#entity[propertyName];
					const uniqueKeys = entry.uniqueKeys;
					const hasDependency = uniqueKeys.some((key) => dependency.includes(key));

					if (hasDependency) {
						const value = this.#entity[propertyName].filter(
							(val) => !entry.uniqueKeys.includes(unsafe(val)),
						);

						// eslint-disable-next-line max-depth
						if (value.length === 0 && !property.required) {
							this.#entity = unsafe(
								Object.freeze(
									Object.fromEntries(
										Object.entries(this.#entity).filter(([key]) => key !== propertyName),
									),
								),
							);
						} else {
							this.#entity = Object.freeze({
								...this.#entity,
								[propertyName]: value,
							});
						}

						// eslint-disable-next-line max-depth
						if (this.#state !== NEW) this.#state = DIRTY;
					}
				} else {
					// eslint-disable-next-line no-lonely-if
					if (entry.uniqueKeys.includes(unsafe(this.#entity[propertyName]))) {
						// eslint-disable-next-line max-depth
						if (property.required) {
							throw new Error(
								`Can't free "${this.schema.type}" from "${entry.schema.type}" reference in the required property "${propertyName}".`,
							);
						}
						this.#entity = unsafe(
							Object.freeze(
								Object.fromEntries(
									Object.entries(this.#entity).filter(([key]) => key !== propertyName),
								),
							),
						);

						// eslint-disable-next-line max-depth
						if (this.#state !== NEW) this.#state = DIRTY;
					}
				}
			}
		}

		return this;
	}

	/**
	 * Returns a copy of the entity with non-primary-key references removed or converted.
	 */
	// eslint-disable-next-line max-statements
	async getFreeOfNonPrimaryKeyDependeciesEntity(): Promise<TEntity> {
		let entity: TEntity = unsafe({ ...this.#entity });

		for (const [propertyName, propertySchema] of Object.entries(this.schema.properties)) {
			if (!isUndefined(propertySchema.reference)) {
				if (Array.isArray(entity[propertyName])) {
					const referencePrimaryKeys: (number | string)[] = [];
					// eslint-disable-next-line no-await-in-loop
					const references = await this.references(propertyName);

					for (const reference of references) {
						// eslint-disable-next-line max-depth
						if (isString(reference.primaryKey) || isNumber(reference.primaryKey)) {
							// eslint-disable-next-line max-depth
							if (!referencePrimaryKeys.includes(reference.primaryKey)) {
								referencePrimaryKeys.push(reference.primaryKey);
							}
						}
					}

					entity = { ...entity, [propertyName]: referencePrimaryKeys };
				} else {
					// eslint-disable-next-line no-await-in-loop
					const reference = await this.reference(propertyName);

					if (isNull(reference) || reference.notHasPrimaryKey) {
						// eslint-disable-next-line max-depth
						if (propertySchema.required)
							throw new Error(
								`Can't free "${this.schema.type}" from "${propertySchema.reference}" reference in the required property "${propertyName}".`,
							);

						entity = omit(entity, propertyName);
					}
				}
			}
		}

		return entity;
	}

	/**
	 * Merges provided fields into the entity, preserving references where applicable.
	 */
	merge(entity: TEntity): void {
		let merged = { ...this.#entity };

		for (const [propertyName, propertySchema] of Object.entries(this.schema.properties)) {
			if (propertyName in entity) {
				if (!isUndefined(propertySchema.reference) && isArray(entity[propertyName])) {
					merged = {
						...merged,
						[propertyName]: uniq([
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							...(isArray(merged[propertyName]) ? merged[propertyName] : []),
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							...entity[propertyName],
						]),
					};
				} else {
					merged = {
						...merged,
						[propertyName]: entity[propertyName],
					};
				}
			}
		}

		this.#entity = Object.freeze(merged);

		if ([CLEAN, DIRTY].includes(this.#state)) this.#state = DIRTY;
	}

	/**
	 * Resolves one reference entry from an array reference property by value.
	 */
	// eslint-disable-next-line max-statements
	async oneReference<TReference extends Entity = Entity>(
		propertyName: string,
		referenceKey?: number | string,
	): Promise<EntityStorageEntry<TReference, TEntityStorageCookie> | null> {
		const propertySchema = this.schema.properties[propertyName];

		if (isUndefined(propertySchema) || isUndefined(propertySchema.reference))
			throw new Error(
				`Property "${propertyName}" is not a reference property of entity type "${this.schema.type}".`,
			);

		const propertyValue = this.#entity[propertyName];

		if (isUndefined(propertyValue) || isNull(propertyValue)) return null;

		if (!isArray(propertyValue))
			throw new Error(
				`Property "${propertyName}" value is not an array of primary keys of the referenced entity type "${propertySchema.reference}".`,
			);

		const referenceSchema = this.storage.entitySchemaRegistry.get(propertySchema.reference);

		if (isUndefined(referenceSchema))
			throw new Error(
				`Referenced entity type schema "${propertySchema.reference}" not found in the registry.`,
			);

		const possibleReferenceKeyProperties = [
			...(isString(referenceSchema.primaryKeyProperty) ? [referenceSchema.primaryKeyProperty] : []),
			...referenceSchema.uniqueProperties,
			...referenceSchema.newUniqueProperties,
		];

		for (const possibleReferenceKeyProperty of possibleReferenceKeyProperties) {
			// eslint-disable-next-line no-await-in-loop
			const reference = await this.storage.one<TReference>(
				propertySchema.reference,
				unsafe({ [possibleReferenceKeyProperty]: referenceKey }),
			);

			if (!isUndefined(reference)) return reference;
		}

		return null;
	}

	/**
	 * Resolves a single referenced entity by property name.
	 */
	// eslint-disable-next-line max-statements
	async reference<TReference extends Entity = Entity>(
		propertyName: string,
	): Promise<EntityStorageEntry<TReference, TEntityStorageCookie> | null> {
		const propertySchema = this.schema.properties[propertyName];

		if (isUndefined(propertySchema) || isUndefined(propertySchema.reference))
			throw new Error(
				`Property "${propertyName}" is not a reference property of entity type "${this.schema.type}".`,
			);

		const propertyValue = this.#entity[propertyName];

		if (isUndefined(propertyValue) || isNull(propertyValue)) return null;

		if (!isString(propertyValue) && !isNumber(propertyValue))
			throw new Error(
				`Property "${propertyName}" value is not a primary key of the referenced entity type "${propertySchema.reference}".`,
			);

		const referenceSchema = this.storage.entitySchemaRegistry.get(propertySchema.reference);

		if (isUndefined(referenceSchema))
			throw new Error(
				`Referenced entity type schema "${propertySchema.reference}" not found in the registry.`,
			);

		const possibleReferenceKeyProperties = [
			...(isString(referenceSchema.primaryKeyProperty) ? [referenceSchema.primaryKeyProperty] : []),
			...referenceSchema.uniqueProperties,
			...referenceSchema.newUniqueProperties,
		];

		for (const possibleReferenceKeyProperty of possibleReferenceKeyProperties) {
			// eslint-disable-next-line no-await-in-loop
			const reference = await this.storage.one<TReference>(
				propertySchema.reference,
				unsafe({ [possibleReferenceKeyProperty]: propertyValue }),
			);

			if (!isUndefined(reference)) return reference;
		}

		return null;
	}

	/**
	 * Resolves all referenced entities for an array reference property.
	 */
	// eslint-disable-next-line max-statements, max-lines-per-function
	async references<TReference extends Entity = Entity>(
		propertyName: string,
	): Promise<EntityStorageEntry<TReference, TEntityStorageCookie>[]> {
		const propertySchema = this.schema.properties[propertyName];

		if (isUndefined(propertySchema) || isUndefined(propertySchema.reference))
			throw new Error(
				`Property "${propertyName}" is not a reference property of entity type "${this.schema.type}".`,
			);

		const propertyValue = this.#entity[propertyName];

		if (isUndefined(propertyValue) || isNull(propertyValue)) return [];

		if (!isArray(propertyValue))
			throw new Error(
				`Property "${propertyName}" value is not an array of primary keys of the referenced entity type "${propertySchema.reference}".`,
			);

		const referenceSchema = this.storage.entitySchemaRegistry.get(propertySchema.reference);

		if (isUndefined(referenceSchema))
			throw new Error(
				`Referenced entity type schema "${propertySchema.reference}" not found in the registry.`,
			);

		const possibleReferenceKeyProperties = [
			// eslint-disable-next-line max-lines
			...(isString(referenceSchema.primaryKeyProperty) ? [referenceSchema.primaryKeyProperty] : []),			
			...referenceSchema.uniqueProperties,
			...referenceSchema.newUniqueProperties,
		];

		const references: EntityStorageEntry<TReference, TEntityStorageCookie>[] = [];

		for (const referenceKey of propertyValue) {
			if (!isString(referenceKey) && !isNumber(referenceKey))
				throw new Error(
					`Property "${propertyName}" value is not a primary key of the referenced entity type "${propertySchema.reference}".`,
				);

			for (const possibleReferenceKeyProperty of possibleReferenceKeyProperties) {
				// eslint-disable-next-line no-await-in-loop
				const reference = await this.storage.one<TReference>(
					propertySchema.reference,
					unsafe({ [possibleReferenceKeyProperty]: referenceKey }),
				);

				 
				if (!isUndefined(reference))
					if (!references.includes(reference)) references.push(reference);
			}
		}

		return references;
	}

	/**
	 * Replaces the tracked entity with a new version and marks it dirty.
	 */
	substitute(entity: TEntity): this {
		if (![CLEAN, DIRTY].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be changed.`);

		this.#entity = Object.freeze({ ...entity });
		this.#state = DIRTY;

		return this;
	}

	/**
	 * Attempts to replace reference properties with primary key values where possible.
	 */
	async tryBringDependenciesToPrimaryKeys(): Promise<boolean> {
		let success = true;

		for (const [propertyName, propertySchema] of Object.entries(this.schema.properties)) {
			if (!isUndefined(propertySchema.reference)) {
				// eslint-disable-next-line no-await-in-loop
				if (!(await this.#tryBringDependencyToPrimaryKey(propertyName))) success = false;
			}
		}

		return success;
	}

	// eslint-disable-next-line max-statements, max-lines-per-function, complexity
	async #tryBringDependencyToPrimaryKey(propertyName: string): Promise<boolean> {
		const propertySchema = this.schema.properties[propertyName];

		if (isUndefined(propertySchema) || isUndefined(propertySchema.reference))
			throw new Error(
				`Property "${propertyName}" is not a reference property of entity type "${this.schema.type}".`,
			);

		const referenceSchema = this.storage.entitySchemaRegistry.get(propertySchema.reference);

		if (isUndefined(referenceSchema))
			throw new Error(
				`Referenced entity type schema "${propertySchema.reference}" not found in the registry.`,
			);

		if (isNull(referenceSchema.primaryKeyProperty)) return false;

		if (
			referenceSchema.uniqueProperties.length === 0 &&
			referenceSchema.newUniqueProperties.length === 0
		)
			return true;

		if (isUndefined(this.#entity[propertyName]) || isNull(this.#entity[propertyName])) return true;

		if (Array.isArray(this.#entity[propertyName])) {
			const referencePrimaryKeys = [];
			let success = true;

			for (const referenceKey of this.#entity[propertyName]) {
				if (
					isNumber(this.#entity[propertyName]) &&
					referenceSchema.canValueOfTypeBeOnlyPrimaryKey('number')
				) {
					referencePrimaryKeys.push(referenceKey);
					// eslint-disable-next-line no-continue
					continue;
				}

				if (
					isString(this.#entity[propertyName]) &&
					referenceSchema.canValueOfTypeBeOnlyPrimaryKey('string')
				) {
					referencePrimaryKeys.push(referenceKey);
					// eslint-disable-next-line no-continue
					continue;
				}

				if (!isNumber(referenceKey) || !isString(referenceKey)) {
					referencePrimaryKeys.push(referenceKey);
					success = false;
					// eslint-disable-next-line no-continue
					continue;
				}

				// eslint-disable-next-line no-await-in-loop
				const reference = await this.oneReference(propertyName, referenceKey);

				if (isNull(reference) || reference.notHasPrimaryKey) success = false;

				referencePrimaryKeys.push(reference?.primaryKey ?? referenceKey);
			}

			this.#entity = unsafe({
				...this.#entity,
				[propertyName]: referencePrimaryKeys,
			});

			return success;
		}

		if (
			isNumber(this.#entity[propertyName]) &&
			referenceSchema.canValueOfTypeBeOnlyPrimaryKey('number')
		)
			return true;

		if (
			isString(this.#entity[propertyName]) &&
			referenceSchema.canValueOfTypeBeOnlyPrimaryKey('string')
		)
			return true;

		const reference = await this.reference(propertyName);

		if (isNull(reference) || reference.notHasPrimaryKey) return false;

		this.#entity = unsafe({
			...this.#entity,
			[propertyName]: reference.primaryKey,
		});

		return true;
	}
}
