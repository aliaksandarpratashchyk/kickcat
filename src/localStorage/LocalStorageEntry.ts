/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export const NEW = 'new';
export const FREEZED = 'freezed';
export const CLEAN = 'clean';
export const DIRTY = 'dirty';
export const KILLED = 'killed';

export interface LocalStorageEntryOptions<T extends LocalStorageEntryPayload> {
	filePath?: string;
	hash?: string;
	index?: number;
	payload: T;
	state?: LocalStorageEntryState;
}

export type LocalStorageEntryPayload = object;

export type LocalStorageEntryState =
	| typeof CLEAN
	| typeof DIRTY
	| typeof FREEZED
	| typeof KILLED
	| typeof NEW;

export default class LocalStorageEntry<T extends LocalStorageEntryPayload> {
	filePath?: string;
	hash?: string;
	index?: number;
	get payload(): T {
		return this.#payload;
	}
	get state(): LocalStorageEntryState {
		return this.#state;
	}

	#payload: T;

	#state: LocalStorageEntryState;

	constructor({ filePath, hash, index, payload, state }: LocalStorageEntryOptions<T>) {
		this.#payload = payload;
		this.hash = hash;
		this.index = index;
		this.filePath = filePath;
		this.#state = state ?? NEW;
	}

	change(payload: Partial<T>): void {
		if (![CLEAN, DIRTY, NEW].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be changed.`);

		this.#payload = { ...this.payload, ...payload };

		if (this.#state === CLEAN || this.#state === KILLED) this.#state = DIRTY;
	}

	delete(): void {
		if (![CLEAN, DIRTY, NEW].includes(this.#state))
			throw new Error(`An entry in state "${this.#state}" can't be killed.`);

		if (this.#state === CLEAN || this.#state === DIRTY) this.#state = KILLED;
		else if (this.#state === NEW) this.#state = FREEZED;
	}

	revive(): void {
		if (this.#state !== FREEZED)
			throw new Error(`An entry in state "${this.#state}" can't be revived.`);

		this.#state = NEW;
	}
}
