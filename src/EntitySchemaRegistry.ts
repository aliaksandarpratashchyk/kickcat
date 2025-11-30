/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "./Entity";
import type EntitySchema from "./EntitySchema";
import type { EntityType } from "./EntityType";
import unsafe from "./unsafe";

export default class EntitySchemaRegistry {
    readonly #entitySchemaMap = new Map<EntityType, EntitySchema>();

    get all(): EntitySchema[] {
        return Array.from(this.#entitySchemaMap.values());
    }

    get(entityType: EntityType): EntitySchema | undefined {
        return this.#entitySchemaMap.get(entityType);
    }

    add<T extends Entity>(entityType: EntityType, entitySchema: EntitySchema<T>): void {
        this.#entitySchemaMap.set(entityType, unsafe(entitySchema));
    }

    resolve(path: string): EntitySchema | undefined {
        function normalize(value: string): string {
            return value.replaceAll(/\\/gu, "/").replaceAll(/\.\.\//gu, ""); 
        }
        const normalized = normalize(path);

        return Array.from(this.#entitySchemaMap.values()).
            find(schema => normalize(schema.filePath).includes(normalized));
    }
}
