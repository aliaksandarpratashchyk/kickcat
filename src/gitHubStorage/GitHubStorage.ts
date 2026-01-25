/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { isUndefined } from 'underscore';

import type { Entity } from '../Entity';
import type EntitySchema from '../EntitySchema';
import type EntitySchemaRegistry from '../EntitySchemaRegistry';
import type { EntityStorage } from '../EntityStorage';
import type LoggerFacade from '../logging/LoggerFacade';
import type GitHubEntityCollection from './GitHubEntityCollection';

import EntityRegistry from '../EntityRegistry';
import EntityStorageEntry, { CLEAN, DIRTY, KILLED, NEW } from '../EntityStorageEntry';
import { type EntityType, ISSUE, LABEL, MILESTONE } from '../EntityType';
import unsafe from '../unsafe';
import GitHubIssueCollection from './GitHubIssueCollection';
import GitHubLabelCollection from './GitHubLabelCollection';
import GitHubMilestoneCollection from './GitHubMilestoneCollection';

/**
 * Configuration for GitHubStorage authorization.
 */
export interface GitHubStorageConfiguration {
	token?: string;
}

/**
 * EntityStorage implementation backed by GitHub REST API collections.
 */
export default class GitHubStorage implements EntityStorage {
	readonly colletions: Record<EntityType, GitHubEntityCollection>;
	readonly entitySchemaRegistry: EntitySchemaRegistry;
	readonly logger: LoggerFacade;
	readonly #entityRegistry: EntityRegistry;

	constructor(
		{ token }: GitHubStorageConfiguration,
		entitySchemaRegistry: EntitySchemaRegistry,
		logger: LoggerFacade,
	) {
		this.colletions = {
			[ISSUE]: new GitHubIssueCollection(token, logger),
			[LABEL]: new GitHubLabelCollection(token, logger),
			[MILESTONE]: new GitHubMilestoneCollection(token, logger),
		};
		this.entitySchemaRegistry = entitySchemaRegistry;
		this.#entityRegistry = new EntityRegistry(entitySchemaRegistry);
		this.logger = logger;
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await, require-yield, @typescript-eslint/no-unused-vars
	async *all<TEntity extends Entity>(_of?: EntityType): AsyncIterable<EntityStorageEntry<TEntity>> {
		throw new Error('Not supported.');
	}

	/**
	 * Pushes pending changes to GitHub.
	 */
	async commit(): Promise<void> {
		await Promise.all(
			this.#entityRegistry
				.all(LABEL)
				.filter((entry) => [DIRTY, KILLED, NEW].includes(entry.state))
				.map(this.#commitOne.bind(this)),
		);

		await Promise.all(
			this.#entityRegistry
				.all(MILESTONE)
				.filter((entry) => [DIRTY, KILLED, NEW].includes(entry.state))
				.map(this.#commitOne.bind(this)),
		);

		await Promise.all(
			this.#entityRegistry
				.all(ISSUE)
				.filter((entry) => [DIRTY, KILLED, NEW].includes(entry.state))
				.map(this.#commitOne.bind(this)),
		);
	}

	/**
	 * Creates a new entry to be sent to GitHub on commit.
	 */
	async new<TEntity extends Entity>(
		of: EntityType,
		entity: TEntity,
	): Promise<EntityStorageEntry<TEntity>> {
		const schema = unsafe<EntitySchema<TEntity>>(this.entitySchemaRegistry.get(of));

		if (isUndefined(schema)) throw new Error(`Can't find "${of}" entity schema.`);

		const entry = new EntityStorageEntry<TEntity>({
			cookie: {
				file: this,
			},
			entity,
			schema,
			state: NEW,
			storage: this,
		});

		this.#entityRegistry.set(entry);
		return Promise.resolve(entry);
	}

	/**
	 * Retrieves one entity from cache or GitHub.
	 */
	async one<TEntity extends Entity>(
		of: EntityType,
		where: Partial<TEntity>,
	): Promise<EntityStorageEntry<TEntity> | undefined> {
		let entry = this.#entityRegistry.one<TEntity>(of, where);

		if (isUndefined(entry)) {
			const entity = await this.colletions[of].get(where);

			if (isUndefined(entity)) return entity;

			const schema = unsafe<EntitySchema<TEntity>>(this.entitySchemaRegistry.get(of));

			if (isUndefined(schema)) throw new Error(`Can't find "${of}" entity schema.`);

			entry = new EntityStorageEntry<TEntity>({
				cookie: {
					file: this,
				},
				entity: unsafe(entity),
				schema,
				state: CLEAN,
				storage: this,
			});

			this.#entityRegistry.set(entry);
		}

		return entry;
	}

	async #commitOne(entry: EntityStorageEntry): Promise<void> {
		if (entry.state === KILLED) {
			await this.colletions[entry.schema.type].delete(entry.entity);
			return;
		}

		if ([DIRTY, NEW].includes(entry.state)) {
			entry.clean(await this.colletions[entry.schema.type].set(entry.entity));
		}
	}
}
