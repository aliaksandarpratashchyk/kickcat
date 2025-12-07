/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import Sandbox from './Sandbox';

/**
 * Utility for working with fixture files under `e2e/__fakes__`.
 */
export default class Fake {
	readonly name: string;
	readonly path: string;
	#eof = false;
	#file = '';

	constructor(name: string) {
		this.name = name;
		this.path = resolve(process.cwd(), 'e2e', '__fakes__', name);
	}

	/**
	 * Lazily reads the fake file contents.
	 */
	async read(): Promise<string> {
		if (!this.#eof) {
			this.#file = await readFile(this.path, { encoding: 'utf-8' });
			this.#eof = true;
		}

		return this.#file;
	}

	/**
	 * Copies the fake file into a temporary sandbox.
	 */
	async toSandbox(): Promise<Sandbox> {
		const sandbox = new Sandbox(this);
		await sandbox.copy();

		return sandbox;
	}

	/**
	 * Returns the filesystem path of the fake file.
	 */
	toString(): string {
		return this.path;
	}
}

/**
 * Factory that returns a fake fixture by name.
 */
export function fake(name: string): Fake {
	return new Fake(name);
}
