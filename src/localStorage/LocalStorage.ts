/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';
import dig from '../dig';
import isYAMLFile from '../isYAMLFile';
import nonNullable from '../nonNullable';
import { type Entity } from "../Entity";
import LocalStorageFile from './LocalStorageFile';
import type EntitySchema from '../EntitySchema';
import { inject } from 'tsyringe';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import type { EntityStorage } from '../EntityStorage';
import type { LocalStorageCookie } from './LocalStorageCookie';
import type EntityStorageEntry from '../EntityStorageEntry';
import type { EntityType } from '../EntityType';
import EntityRegistry from '../EntityRegistry';
import LoggerFacade from '../logging/LoggerFacade';

export interface LocalStorageConfiguration<T extends Entity> {
	storagePath: string;
	entitySchema: EntitySchema<T>;
}

export default class LocalStorage implements EntityStorage<LocalStorageCookie> {
	readonly storagePath: string;
	readonly entitySchemaRegistry: EntitySchemaRegistry;
	readonly #entityRegistry: EntityRegistry<LocalStorageCookie>;
	readonly #logger: LoggerFacade;
	#fetched = false;		
	get fetched(): boolean {
		return this.#fetched;
	}
	readonly #files = new Map<string, LocalStorageFile>();		

	constructor(
		storagePath: string, 
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
		@inject(LoggerFacade) logger: LoggerFacade
	) {
		this.storagePath = storagePath;
		this.entitySchemaRegistry = entitySchemaRegistry;
		this.#entityRegistry = new EntityRegistry<LocalStorageCookie>(this.entitySchemaRegistry);
		this.#logger = logger;
	}		

	async one<TEntity extends Entity>(of: EntityType, where: Partial<TEntity>): 
		Promise<EntityStorageEntry<TEntity, LocalStorageCookie> | undefined> {

		await this.#reindex();
		return this.#entityRegistry.one<TEntity>(of, where);			
	}

	async *all<TEntity extends Entity>(of?: EntityType):
			AsyncIterable<EntityStorageEntry<TEntity, LocalStorageCookie>> {

		await this.#reindex();

		for (const entry of this.#entityRegistry.all<TEntity>(of))
			yield entry;		
	}	

	async new<TEntity extends Entity>(of: EntityType, entity: TEntity): 
		Promise<EntityStorageEntry<TEntity, LocalStorageCookie>> {
		
		return (await this.#getOrphanage(of)).new<TEntity>(of, entity);		
	}

	async commit(): Promise<void> {	
		this.#logger.debug(`Commiting local storage changes...`);

		await this.#fetch();

		for (const file of this.#files.values()) {
			// eslint-disable-next-line no-await-in-loop
			await file.commit();
		}			
	}			

	async #fetch(): Promise<void> {
		if (this.#fetched)
			return;
		
		(await dig(this.storagePath)).filter(isYAMLFile).forEach(filePath => {			
			this.#files.set(
				filePath, 
				new LocalStorageFile(
					{ filePath }, 
					this.entitySchemaRegistry, 
					this.#logger));
		});		

		this.#fetched = true;
	}

	async #getOrphanage(entityType: EntityType): Promise<LocalStorageFile> {		
		const orphanagePath = await this.#resolveOrphanagePath(entityType);
		
		if (this.#files.has(orphanagePath))
			return nonNullable(this.#files.get(orphanagePath));

		const orphanage = new LocalStorageFile({
			filePath: orphanagePath 
		},
		this.entitySchemaRegistry, 
		this.#logger);

		this.#files.set(orphanagePath, orphanage);
		return orphanage;
	}		

	// eslint-disable-next-line max-statements
	async #resolveOrphanagePath(entityType: EntityType): Promise<string> {
		await this.#fetch();

		const stats = await stat(this.storagePath);

		if (stats.isFile())
			return this.storagePath;

		if (stats.isDirectory()) {
			const inStorage = await readdir(this.storagePath);
			const forEntity = inStorage.filter(path => path.includes(entityType));

			if (forEntity.length > 1)
				throw new Error(`Can't resolve path for "${entityType}" storage. Found ${forEntity.length} candidates: ${forEntity.join(', ')}`);

			if (forEntity.length === 0)
				return resolve(this.storagePath, 'hub.yml');

			const forEntityStats = await stat(nonNullable(forEntity[0]));

			if (forEntityStats.isFile())
				return nonNullable(forEntity[0]);
			else if (forEntityStats.isDirectory()) {
				return (
					(await readdir(nonNullable(forEntity[0]))).find((file) => /(?:common|shared)/u.exec(file)) ??
					resolve(this.storagePath, 'shared.yml')
				);
			}
		}
		
		throw new Error(`Can't resolve path to storage for ${entityType}.`);
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
}
