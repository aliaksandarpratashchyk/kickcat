/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { readFile, unlink, writeFile } from 'fs/promises';
import { dirname, posix as pathPosix } from 'path';
import { inject } from 'tsyringe';
import { groupBy, isString, isUndefined, sortBy } from 'underscore';
import { Document, parseAllDocuments, YAMLMap } from 'yaml';

import type EntitySchema from '../EntitySchema';
import type { EntityStorage } from '../EntityStorage';
import type LocalStorage from './LocalStorage';
import type { LocalStorageCookie } from './LocalStorageCookie';

import { type Entity } from '../Entity';
import EntityRegistry from '../EntityRegistry';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import EntityStorageEntry, { CLEAN, DIRTY, KILLED, NEW } from '../EntityStorageEntry';
import { type EntityType, isEntityType } from '../EntityType';
import hash from '../hash';
import LoggerFacade from '../logging/LoggerFacade';
import nonNullable from '../nonNullable';
import toYAML from '../toYAML';
import unsafe from '../unsafe';

/**
 * Configuration for creating a LocalStorageFile.
 */
export interface LocalStorageFileConfiguration {
	filePath: string;
}

const COMMENT_REGEX = /^#?\s*(?<key>[^:]+):\s*(?<value>.+)\s*$/u;

/**
 * Manages a single YAML file that stores entities of various types.
 */
export default class LocalStorageFile implements EntityStorage<LocalStorageCookie> {
	readonly entitySchemaRegistry: EntitySchemaRegistry;
	readonly filePath: string;
	readonly storage: LocalStorage;
	readonly #entityRegistry: EntityRegistry<LocalStorageCookie>;
	#eof = false;
	readonly #logger: LoggerFacade;

	// eslint-disable-next-line @typescript-eslint/max-params
	constructor(
		{ filePath }: LocalStorageFileConfiguration,
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
		@inject(LoggerFacade) logger: LoggerFacade,
		storage: LocalStorage,
	) {
		this.filePath = filePath;
		this.entitySchemaRegistry = entitySchemaRegistry;
		this.#entityRegistry = new EntityRegistry<LocalStorageCookie>(this.entitySchemaRegistry);
		this.#logger = logger;
		this.storage = storage;
	}

	/**
	 * Streams all entries from this file, optionally filtered by type.
	 */
	async *all<TEntity extends Entity>(
		of?: EntityType,
	): AsyncIterable<EntityStorageEntry<TEntity, LocalStorageCookie>> {
		await this.#reindex();

		for (const entry of this.#entityRegistry.all<TEntity>(of)) yield entry;
	}

	/**
	 * Writes any dirty/new/deleted entries back to disk.
	 */
	// eslint-disable-next-line max-statements
	async commit(): Promise<void> {
		this.#logger.debug(`Commiting changes to "${this.filePath}"...`);

		await this.#reindex();

		const entries = this.#entityRegistry.all();
		const hasSomethingToCommit = entries.some(
			(entry) => [DIRTY, KILLED, NEW].includes(entry.state) || hash(entry.entity) !== entry.hash,
		);

		const grouped = groupBy(entries, (entry) => entry.state);
		this.#logger.debug(
			`Have ${Object.entries(grouped)
				.map(([state, group]) => `[${state.toUpperCase()}]: ${group.length}`)
				.join(', ')}`,
		);

		if (hasSomethingToCommit) {
			const toCommit = entries.filter((entry) => ![KILLED].includes(entry.state));

			if (toCommit.length === 0) await unlink(this.filePath);
			else {
				const documents = sortBy(
					toCommit,
					(entry) => entry.cookie.index ?? Number.MAX_SAFE_INTEGER,
				).map((entry) => this.#toDocument(entry));

				const yaml = documents
					.map((document) => document.toString().trimEnd())
					.join('\n\n---\n')
					.concat('\n');

				await writeFile(this.filePath, yaml);

				toCommit.forEach((entry) => {					
					entry.clean(entry.entity);
				});				
			}

			entries.filter((entry) => [KILLED].includes(entry.state)).forEach((entry) => {
				this.#entityRegistry.delete(entry);
			});
						
		} else {
			this.#logger.debug(`Skipping commit to "${this.filePath}". Nothing changed.`);
		}
	}

	async new<TEntity extends Entity>(
		of: EntityType,
		entity: TEntity,
	): Promise<EntityStorageEntry<TEntity, LocalStorageCookie>> {
		const schema = unsafe<EntitySchema<TEntity>>(this.entitySchemaRegistry.get(of));

		if (isUndefined(schema)) throw new Error(`Can't find "${of}" entity schema.`);

		const entry = new EntityStorageEntry<TEntity, LocalStorageCookie>({
			cookie: {
				file: this,
			},
			entity,
			schema,
			state: NEW,
			storage: this.storage,
		});

		const entitySchema = this.entitySchemaRegistry.get(of);

		if (isUndefined(entitySchema)) throw new Error(`Can't find "${of}" entity schema.`);

		this.#entityRegistry.set(entry);
		return Promise.resolve(entry);
	}

	async one<TEntity extends Entity>(
		of: EntityType,
		where: Partial<TEntity>,
	): Promise<EntityStorageEntry<TEntity, LocalStorageCookie> | undefined> {
		await this.#reindex();
		return this.#entityRegistry.one<TEntity>(of, where);
	}

	// eslint-disable-next-line max-statements, max-lines-per-function, complexity
	async #reindex(): Promise<void> {
		if (this.#eof) return;

		const raw = await readFile(this.filePath, 'utf8');
		const documents = parseAllDocuments(raw);

		for (let index = 0; index < documents.length; index++) {
			const document = nonNullable(documents[index]);
			const entity = unsafe<Entity>(document.toJS());
			let savedHash: string | undefined = '';
			let schemaPath: null | string = null;
			let savedType: EntityType | null = null;
			let comment: null | string = null;
			let hasKickcatHints = false;

			if (isString(document.commentBefore)) comment = document.commentBefore;
			else if (isString(document.contents?.commentBefore))
				comment = document.contents.commentBefore;

			if (comment !== null) {
				this.#logger.debug(`Parsing comment before document #${index}:\n${comment}`);

				const parsedCommentBefore = parseAllCommentBefore(comment);
				if ('hash' in parsedCommentBefore) {
					savedHash = parsedCommentBefore['hash'];
					this.#logger.debug(`Found saved hash: ${savedHash}`);
				}
				if ('yaml-language-server' in parsedCommentBefore) {
					this.#logger.debug(
						`Found yaml-language-server schema info: ${parsedCommentBefore['yaml-language-server']}`,
					);
					const match = /\$schema=(?<schema>.+)/u.exec(parsedCommentBefore['yaml-language-server']);

					if (match !== null) {
						const candidate = match[1]?.trim() ?? null;
						const looksLikeKickcatSchema =
							candidate !== null &&
							/(?:^|[\\/])(?:issue|label|milestone)\.schema\.yml$/u.exec(candidate) !== null;

						if (looksLikeKickcatSchema) {
							schemaPath = candidate;
							hasKickcatHints = true;
							this.#logger.debug(`Resolved schema path: ${schemaPath}`);
						}
					}
				}
				if ('type' in parsedCommentBefore) {
					this.#logger.debug(`Found saved type: ${parsedCommentBefore['type']}`);
					const savedTypeAsString = parsedCommentBefore['type'];
					if (isEntityType(savedTypeAsString)) {
						savedType = savedTypeAsString;
						hasKickcatHints = true;
						this.#logger.debug(`Resolved saved type: ${savedType}`);
					}
				}
			}

			// eslint-disable-next-line @typescript-eslint/init-declarations
			let entitySchema: EntitySchema | undefined;

			if (savedType !== null) {
				entitySchema = this.entitySchemaRegistry.get(savedType);
				this.#logger.debug(`Resolved entity schema by saved type: ${entitySchema?.type}`);
			} else if (schemaPath !== null) {
				entitySchema = this.entitySchemaRegistry.resolve(schemaPath, this.#logger);
				this.#logger.debug(`Resolved entity schema by schema path: ${entitySchema?.type}`);
			}

			if (isUndefined(entitySchema)) {
				entitySchema = this.entitySchemaRegistry.all.find((schema) => schema.validate(entity));
				if (!isUndefined(entitySchema)) hasKickcatHints = true;
			}

			if (isUndefined(entitySchema)) {
				if (hasKickcatHints) throw new Error(`Can't resolve schema for entity.`);
				this.#logger.debug(
					`Skipping YAML document #${index} in "${this.filePath}" (not a KickCat entity).`,
				);
				// eslint-disable-next-line no-continue
				continue;
			}

			if (entitySchema.validate(entity)) {
				if (savedHash.trim() === '')
					// eslint-disable-next-line no-undefined
					savedHash = undefined;

				const entry = new EntityStorageEntry({
					cookie: {
						file: this,
						index,
					},
					entity,
					hash: savedHash,
					schema: entitySchema,
					state: CLEAN,
					storage: this.storage,
				});

				this.#entityRegistry.set(entry);
			}
		}

		this.#eof = true;
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	#relativePosix(from: string, to: string): string {
		// eslint-disable-next-line func-style
		const toPosix = (path: string): string =>
			path
				.replaceAll('\\', '/')
				.replace(/^(?<temp1>[A-Za-z]):/u, (_match, drive: string) => `/${drive.toLowerCase()}`);

		return pathPosix.relative(toPosix(from), toPosix(to));
	}

	#toDocument(entry: EntityStorageEntry): Document {
		const schema = this.entitySchemaRegistry.get(entry.schema.type);

		if (isUndefined(schema)) throw new Error(`Can't find schema "${schema}".`);

		const document = new Document();
		const schemaPath = this.#relativePosix(dirname(this.filePath), schema.filePath);
		const updateHash = entry.state !== CLEAN && !entry.preserveHash || this.storage.repair;
		const hashToWrite = updateHash ? hash(entry.entity) : entry.hash;

		document.commentBefore = [
			` yaml-language-server: $schema=${schemaPath}`,
			...(isUndefined(hashToWrite) ? [] : [` hash: ${hashToWrite}`]),
		].join('\n');
		document.contents = this.#toOrderedYamlMap(entry.entity, schema);

		return document;
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	#toOrderedYamlMap(entity: Entity, entitySchema: EntitySchema): YAMLMap {
		const map = new YAMLMap();
		const orderedKeys = Object.entries(entitySchema.properties)
			.sort(([, left], [, right]) => left.order - right.order)
			.map(([key]) => key);
		const extraKeys = Object.keys(entity)
			.filter((key) => !orderedKeys.includes(key))
			.toSorted();

		for (const key of [...orderedKeys, ...extraKeys]) {
			if (!(key in entity))
				// eslint-disable-next-line no-continue
				continue;

			const value = entity[key];
			map.add({ key, value: toYAML(value) });
		}

		return map;
	}
}

function parseAllCommentBefore(commentBefore: string): Record<string, string> {
	return Object.fromEntries(
		commentBefore
			.split(/(?:\r\n|\r|\n)+/u)
			.map((line) => parseCommentBefore(line.trim()))
			.filter((match) => match !== null),
	);
}

function parseCommentBefore(comment: string): [string, string] | null {
	const match = COMMENT_REGEX.exec(comment);

	if (match === null || isUndefined(match[1]) || isUndefined(match[2])) return null;

	return [match[1], match[2]];
}
