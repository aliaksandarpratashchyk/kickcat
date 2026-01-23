/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import type Fake from './Fake';

/**
 * Disposable sandbox copy of a fake fixture file.
 */
export default class Sandbox {
	readonly fake: Fake;
	path: string;
	#ready = false;

	constructor(fake: Fake) {
		this.fake = fake;
		this.path = resolve(
			process.cwd(),
			'e2e',
			'__sandbox__',
			`${this.fake.name}+${randomUUID()}.yml`,
		);
	}

	/**
	 * Copies the fake file into the sandbox location once.
	 */
	async copy(): Promise<void> {
		if (this.#ready) return;

		await mkdir(dirname(this.path), { recursive: true });
		await copyFile(this.fake.path, this.path);

		this.#ready = true;
	}

	/**
	 * Deletes the sandbox file if it was created.
	 */
	async delete(): Promise<void> {
		if (!this.#ready) return;

		await unlink(this.path);
		this.#ready = false;
	}

	/**
	 * Reads sandbox file contents.
	 */
	async read(): Promise<string> {
		return readFile(this.path, { encoding: 'utf-8' });
	}

	/**
	 * Returns the sandbox file path.
	 */
	toString(): string {
		return this.path;
	}
}
