/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { isNull, isNumber, isString, isUndefined } from "underscore";
import type { Entity } from "./Entity";
import type EntitySchemaRegistry from "./EntitySchemaRegistry";
import type { EntityStorageCookie } from "./EntityStorageCookie";
import type EntityStorageEntry from "./EntityStorageEntry";
import type { EntityType } from "./EntityType";
import unsafe from "./unsafe";

export default class EntityRegistry<
    TEntityStorageCookie extends EntityStorageCookie = EntityStorageCookie> {
    readonly schemaRegistry: EntitySchemaRegistry;
    readonly #all = new Set<EntityStorageEntry<Entity, TEntityStorageCookie>>();
    readonly #byType =
        new Map<EntityType, Set<EntityStorageEntry<Entity, TEntityStorageCookie>>>();
    readonly #index = new Map<EntityType, Map<string, Map<number | string, EntityStorageEntry<Entity, TEntityStorageCookie>>>>();

    constructor(schemaRegistry: EntitySchemaRegistry) {
        this.schemaRegistry = schemaRegistry;
    }

    one<TEntity extends Entity>(of: EntityType, where: Partial<TEntity>):
        EntityStorageEntry<TEntity, TEntityStorageCookie> {

        return unsafe<EntityStorageEntry<TEntity, TEntityStorageCookie>>(Object.entries(where).
            map(([propertyKey, propertyValue]) =>
                this.#index.get(of)?.get(propertyKey)?.get(unsafe<string | number>(propertyValue))
            ).
            at(0));
    }

    all<TEntity extends Entity>(of?: EntityType):
        EntityStorageEntry<TEntity, TEntityStorageCookie>[] {

        if (isUndefined(of))
            return unsafe(Array.from(this.#all));

        return unsafe(Array.from(this.#byType.get(of) ?? []));
    }

    set<TEntity extends Entity>(entry: EntityStorageEntry<TEntity, TEntityStorageCookie>): void {
        this.#all.add(unsafe(entry));
        this.#setByType(entry.schema.type, unsafe(entry));
        this.#setIndex(entry.schema.type, unsafe(entry));
    }

    #setByType(of: EntityType, entry: EntityStorageEntry<Entity, TEntityStorageCookie>): void {
        const entries = this.#byType.get(of) ??
            new Set<EntityStorageEntry<Entity, TEntityStorageCookie>>();

        this.#byType.set(of, entries);

        entries.add(entry);
    }

    // eslint-disable-next-line max-statements
    #setIndex(of: EntityType, entry: EntityStorageEntry<Entity, TEntityStorageCookie>): void {
        const byType = this.#index.get(of) ??
            new Map<string, Map<number | string, EntityStorageEntry<Entity, TEntityStorageCookie>>>();

        this.#index.set(of, byType);

        const schema = this.schemaRegistry.get(of);

        if (isUndefined(schema))
            throw new Error(`Can't find "${of}" schema.`);

        for (const [propertyKey, property] of Object.entries(schema.properties)) {
            if (property.primaryKey ||
                property.unique || 
                isNull(entry.primaryKey) && property.newUnique) {
                const byPropertyKey = byType.get(propertyKey) ??
                    new Map<number | string, EntityStorageEntry<Entity, TEntityStorageCookie>>();

                byType.set(propertyKey, byPropertyKey);

                const propertyValue = unsafe<Record<string, unknown>>(entry.entity)[propertyKey];

                if (isNumber(propertyValue) || isString(propertyValue))
                    byPropertyKey.set(propertyValue, entry);
            }            
        }
    }
}