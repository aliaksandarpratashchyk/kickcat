/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { mkdir, readdir, stat, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { inject } from 'tsyringe';

import type { EntityStorage } from '../EntityStorage';
import EntityStorageEntry, { KILLED } from '../EntityStorageEntry';
import type { EntityType } from '../EntityType';
import type { LocalStorageCookie } from './LocalStorageCookie';

import dig from '../dig';
import { type Entity } from '../Entity';
import EntityRegistry from '../EntityRegistry';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import { exists } from '../exists';
import isYAMLFile from '../isYAMLFile';
import LoggerFacade from '../logging/LoggerFacade';
import nonNullable from '../nonNullable';
import LocalStorageFile from './LocalStorageFile';

/**
 * Configuration for initializing a local storage file.
 */
export interface LocalStorageConfiguration {
	repair?: boolean;
	storagePath?: string;
}

/**
 * File-based implementation of `EntityStorage` backed by YAML files.
 */
export default class LocalStorage implements EntityStorage<LocalStorageCookie> {
	readonly entitySchemaRegistry: EntitySchemaRegistry;
	readonly storagePath: string;
	readonly repair: boolean;
	get fetched(): boolean {
		return this.#fetched;
	}
	readonly #entityRegistry: EntityRegistry<LocalStorageCookie>;
	#fetched = false;
	readonly #files = new Map<string, LocalStorageFile>();
	readonly #logger: LoggerFacade;

	constructor(
		{ storagePath, repair }: LocalStorageConfiguration,
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
		@inject(LoggerFacade) logger: LoggerFacade,
	) {
		this.storagePath = storagePath ?? process.cwd();
		this.repair = repair ?? false;

		this.entitySchemaRegistry = entitySchemaRegistry;
		this.#entityRegistry = new EntityRegistry<LocalStorageCookie>(this.entitySchemaRegistry);
		this.#logger = logger;
	}

	/**
	 * Streams entries from storage, optionally filtered by entity type.
	 */
	async *all<TEntity extends Entity>(
		of?: EntityType,
	): AsyncIterable<EntityStorageEntry<TEntity, LocalStorageCookie>> {
		await this.#reindex();

		for (const entry of this.#entityRegistry.all<TEntity>(of)) yield entry;
	}

	/**
	 * Flushes changes in all tracked files to disk.
	 */
	async commit(): Promise<void> {
		this.#logger.debug(`Commiting local storage changes...`);

		await this.#fetch();

		for (const file of this.#files.values()) {
			// eslint-disable-next-line no-await-in-loop
			await file.commit();
		}

		this.#entityRegistry.all().filter((entry) => [KILLED].includes(entry.state)).forEach((entry) => {
			this.#entityRegistry.delete(entry);
		});
	}

	async new<TEntity extends Entity>(
		of: EntityType,
		entity: TEntity,
	): Promise<EntityStorageEntry<TEntity, LocalStorageCookie>> {
		return (await this.#getOrphanage(of)).new<TEntity>(of, entity);
	}

	async one<TEntity extends Entity>(
		of: EntityType,
		where: Partial<TEntity>,
	): Promise<EntityStorageEntry<TEntity, LocalStorageCookie> | undefined> {
		await this.#reindex();
		return this.#entityRegistry.one<TEntity>(of, where);
	}

	async #fetch(): Promise<void> {
		if (this.#fetched) return;

		(await dig(this.storagePath)).filter(isYAMLFile).forEach((filePath) => {
			this.#files.set(
				filePath,
				new LocalStorageFile({ filePath }, this.entitySchemaRegistry, this.#logger, this),
			);
		});

		this.#fetched = true;
	}

	async #getOrphanage(entityType: EntityType): Promise<LocalStorageFile> {
		const orphanagePath = await this.#resolveOrphanagePath(entityType);

		if (this.#files.has(orphanagePath)) return nonNullable(this.#files.get(orphanagePath));

		const orphanage = new LocalStorageFile(
			{
				filePath: orphanagePath,
			},
			this.entitySchemaRegistry,
			this.#logger,
			this,
		);

		this.#files.set(orphanagePath, orphanage);
		return orphanage;
	}

	async #reindex(): Promise<void> {
		await this.#fetch();

		for (const file of this.#files.values()) {
			// eslint-disable-next-line no-await-in-loop
			for await (const entry of file.all<Entity>()) {
				this.#entityRegistry.set(entry);
			}
		}
	}

	// eslint-disable-next-line max-statements
	async #resolveOrphanagePath(entityType: EntityType): Promise<string> {
		await this.#fetch();

		if (!(await exists(this.storagePath))) {
			if (this.storagePath.endsWith('.yml') || this.storagePath.endsWith('.yaml'))
				await writeFile(this.storagePath, '');
			else await mkdir(this.storagePath);
		}

		const stats = await stat(this.storagePath);

		if (stats.isFile()) return this.storagePath;

		if (stats.isDirectory()) {
			const inStorage = await readdir(this.storagePath);
			const forEntity = inStorage.filter((path) => path.includes(entityType));

			if (forEntity.length > 1)
				throw new Error(
					`Can't resolve path for "${entityType}" storage. Found ${forEntity.length} candidates: ${forEntity.join(', ')}`,
				);

			if (forEntity.length === 0) return resolve(this.storagePath, `${entityType}.yml`);

			const forEntityStats = await stat(nonNullable(forEntity[0]));

			if (forEntityStats.isFile()) return nonNullable(forEntity[0]);
			else if (forEntityStats.isDirectory()) {
				return (
					(await readdir(nonNullable(forEntity[0]))).find((file) =>
						/(?:common|shared)/u.exec(file),
					) ?? resolve(this.storagePath, 'shared.yml')
				);
			}
		}

		throw new Error(`Can't resolve path to storage for ${entityType}.`);
	}
}
