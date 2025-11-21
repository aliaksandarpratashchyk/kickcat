/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

// eslint-disable-next-line import-x/no-named-as-default
import Ajv, { type JSONSchemaType, type Schema, type ValidateFunction } from 'ajv';
import { readFile, stat, unlink, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { groupBy, isUndefined, sortBy, uniq } from 'underscore';
import { Document, parse } from 'yaml';

import { deep } from '../deep';
import hash from '../hash';
import isYAMLFile from '../isYAMLFile';
import nonNullable from '../nonNullable';
import toYAML from '../toYAML';
import LocalStorageEntry, {
	CLEAN,
	DIRTY,
	FREEZED,
	KILLED,
	type LocalStorageEntryPayload,
	NEW,
} from './LocalStorageEntry';

export interface LocalStorageConfiguration {
	path: string;
	schema: JSONSchemaType<LocalStorageFile<LocalStorageEntryPayload>> | Schema;
}

type LocalStorageFile<T extends LocalStorageEntryPayload> =
	| NormalizedLocalStorageFile<T>
	| Record<string, NormalizedLocalStorageFile<T>>;

type NormalizedLocalStorageFile<T extends LocalStorageEntryPayload> = T[];

export default class LocalStorage<T extends LocalStorageEntryPayload> {
	readonly configuration: LocalStorageConfiguration;
	readonly validate: ValidateFunction;
	get all(): Iterable<LocalStorageEntry<T>> {
		return this.#entries;
	}
	readonly #entries = new Set<LocalStorageEntry<T>>();
	#fetched = false;

	readonly #fetchedFiles = new Set<string>();

	constructor(configuration: LocalStorageConfiguration) {
		this.configuration = configuration;

		const ajv = new Ajv({ allErrors: true });
		this.validate = ajv.compile(this.configuration.schema);
	}

	async commit(): Promise<void> {
		await this.#eliminateOrphans();

		await Promise.all(
			Object.keys(
				groupBy(this.#entries.values().toArray(), (entry) => nonNullable(entry.filePath)),
			).map(this.#commitFile.bind(this)),
		);
	}

	async fetch(): Promise<void> {
		if (this.#fetched) return;

		await Promise.all(
			(await deep(this.configuration.path)).filter(isYAMLFile).map(this.#fetchFile.bind(this)),
		);

		this.#fetched = true;
	}

	new(payload: T): void {
		this.#entries.add(new LocalStorageEntry<T>({ payload }));
	}

	async #commitFile(filePath: string): Promise<void> {
		const hasSomethingToCommit = this.#entries
			.values()
			.filter((entry) => entry.filePath === filePath)
			.some((entry) => [DIRTY, KILLED, NEW].includes(entry.state));

		if (hasSomethingToCommit) {
			await this.#fetchFile(filePath);
			const toCommit = this.#entries
				.values()
				.filter((entry) => entry.filePath === filePath)
				.filter((entry) => ![FREEZED, KILLED].includes(entry.state))
				.toArray();

			toCommit.forEach((entry) => {
				entry.hash = hash(entry.payload);
			});

			if (toCommit.length === 0) await unlink(filePath);
			else {
				const yaml = toYAML(
					sortBy(toCommit, (entry) => entry.index ?? Number.MAX_SAFE_INTEGER).map((entry) => ({
						...entry.payload,
						hash: entry.hash,
					})),
				);
				const document = new Document();
				document.contents = yaml;
				await writeFile(filePath, document.toString());
			}
		}
	}

	async #eliminateOrphans(): Promise<void> {
		const orphans = this.#entries
			.values()
			.filter((entry) => isUndefined(entry.filePath))
			.toArray();

		if (orphans.length > 0) {
			const orphanagePath = await this.#resolveOrphanagePath();

			orphans.forEach((orphan) => {
				orphan.filePath = orphanagePath;
			});
		}
	}

	async #fetchFile(filePath: string): Promise<void> {
		if (this.#fetchedFiles.has(filePath)) return;

		const raw = await readFile(filePath, 'utf8');

		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		const parsed = parse(raw) as LocalStorageFile<T>;

		if (this.validate(parsed)) {
			const normalized = normalizeLocalStorageFile<T>(parsed);

			for (let index = 0; index < normalized.length; index++) {
				this.#entries.add(
					new LocalStorageEntry<T>({
						filePath,
						index,
						payload: nonNullable(normalized[index]),
						state: CLEAN,
					}),
				);
			}
		}

		this.#fetchedFiles.add(filePath);
	}

	#getUsedFiles(): string[] {
		return uniq(
			this.#entries
				.values()
				.toArray()
				.map((entry) => entry.filePath)
				.filter((filePath) => !isUndefined(filePath)),
		);
	}

	async #resolveOrphanagePath(): Promise<string> {
		const files = this.#getUsedFiles();

		if (files.length === 1) return nonNullable(files[0]);

		const stats = await stat(this.configuration.path);

		if (stats.isFile()) return this.configuration.path;

		return (
			files.find((file) => /(?:common|shared)/u.exec(file)) ??
			resolve(this.configuration.path, 'shared.yml')
		);
	}
}

function normalizeLocalStorageFile<T extends LocalStorageEntryPayload>(
	file: LocalStorageFile<T>,
): NormalizedLocalStorageFile<T> {
	if (Array.isArray(file)) return file;

	const keys = Object.keys(file);

	if (keys.length !== 1 || !Array.isArray(nonNullable(file[nonNullable(keys[0])])))
		throw new Error('Invalid local storage file format');

	return nonNullable(file[nonNullable(keys[0])]);
}
