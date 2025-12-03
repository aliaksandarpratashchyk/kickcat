/**
 * KickCat v0.4.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "../Entity";
import type EntityStorageEntryBinding from "./EntityStorageEntryBinding";

export default class EntityStorageEntryBindingBag<TEntity extends Entity = Entity> {
    readonly #bindings: EntityStorageEntryBinding<TEntity>[] = [];
    
    get bindings(): readonly EntityStorageEntryBinding<TEntity>[] {
        return this.#bindings;
    }

    add(binding: EntityStorageEntryBinding<TEntity>): void {
        this.#bindings.push(binding);
    }

    pullAll(): void {
        for (const binding of this.#bindings)
            binding.pull();
    }
}