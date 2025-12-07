/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Entity } from './Entity';
import type EntitySchema from './EntitySchema';
import type { EntityType } from './EntityType';

import unsafe from './unsafe';

/**
 * Registry holding resolved entity schemas by type.
 */
export default class EntitySchemaRegistry {
	/**
	 * Returns all registered schemas.
	 */
	get all(): EntitySchema[] {
		return Array.from(this.#entitySchemaMap.values());
	}

	readonly #entitySchemaMap = new Map<EntityType, EntitySchema>();

	/**
	 * Registers an entity schema for a type.
	 */
	add<T extends Entity>(entityType: EntityType, entitySchema: EntitySchema<T>): void {
		this.#entitySchemaMap.set(entityType, unsafe(entitySchema));
	}

	/**
	 * Retrieves a schema by entity type.
	 */
	get(entityType: EntityType): EntitySchema | undefined {
		return this.#entitySchemaMap.get(entityType);
	}

	/**
	 * Finds a schema whose file path matches the provided path fragment.
	 */
	resolve(path: string): EntitySchema | undefined {
		function normalize(value: string): string {
			return value.replaceAll(/\\/gu, '/').replaceAll(/\.\.\//gu, '');
		}
		const normalized = normalize(path);

		return Array.from(this.#entitySchemaMap.values()).find((schema) =>
			normalize(schema.filePath).includes(normalized),
		);
	}
}
