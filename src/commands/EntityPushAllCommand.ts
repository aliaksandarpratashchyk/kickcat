/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { inject, singleton } from 'tsyringe';
import { isUndefined } from 'underscore';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';
import type { Entity } from '../Entity';
import type { EntityStorage } from '../EntityStorage';
import type EntityStorageEntry from '../EntityStorageEntry';

import booleanType from '../cli/BooleanType';
import { entityTypeType } from '../EntityType';
import hash from '../hash';
import LoggerFacade from '../logging/LoggerFacade';
import unsafe from '../unsafe';
import EntityStorageEntryBinding, { MERGE, SUBSTITUTE } from './EntityStorageEntryBinding';
import EntityStorageEntryBindingBag from './EntityStorageEntryBindingBag';

/**
 * Pushes all entities from local storage to remote storage, handling dependencies in two passes.
 */
@singleton()
export default class EntityPushAllCommand
	implements ClassCommand<typeof EntityPushAllCommand.schema>
{
	static readonly schema = {
		description: 'Push all labels from the local storage to the remote storage.',
		parameters: {
			force: {
				defaultValue: false,
				description: 'Force push even if hashes match.',
				type: booleanType,
			},
			of: {
				description: 'Entity type to delete.',
				type: entityTypeType,
			},
		},
	} satisfies ClassCommandSchema;

	readonly #localStorage: EntityStorage;
	readonly #logger: LoggerFacade;
	readonly #remoteStorage: EntityStorage;
	#stripCrossTypeReferences = false;

	constructor(
		@inject('RemoteStorage') remoteStorage: EntityStorage,
		@inject('LocalStorage') localStorage: EntityStorage,
		@inject(LoggerFacade) logger: LoggerFacade,
	) {
		this.#remoteStorage = remoteStorage;
		this.#localStorage = localStorage;
		this.#logger = logger;
	}

	// eslint-disable-next-line max-statements
	async execute({
		force,
		of,
	}: ClassCommandOptions<typeof EntityPushAllCommand.schema>): Promise<void> {
		this.#stripCrossTypeReferences = !isUndefined(of);

		this.#logger.info(
			`Pushing all entities${of ? ` of type ${of}` : ''} from the local to the remote storage.`,
		);
		this.#logger.info(`Taking the first run, trying to resolve as many dependencies as possible.`);

		const firstRunBindingBag = new EntityStorageEntryBindingBag();

		for await (const localEntry of this.#localStorage.all(of)) {
			await this.#pushOneOnFirstRun(localEntry, firstRunBindingBag, force);
		}

		this.#logger.info(`Commiting changes to the remote storage.`);
		await this.#remoteStorage.commit();

		firstRunBindingBag.pullAll();

		this.#logger.info(`Taking the second run, pushing remaining entities.`);

		const secondRunBindingBag = new EntityStorageEntryBindingBag();

		 
		for (const binding of firstRunBindingBag.bindings)
			// eslint-disable-next-line no-await-in-loop
			await this.#pushOneOnSecondRun(binding.target, binding.source, secondRunBindingBag);

		this.#logger.info(`Commiting changes to the remote storage second time.`);
		await this.#remoteStorage.commit();

		secondRunBindingBag.pullAll();

		for (const binding of firstRunBindingBag.bindings) {
			// eslint-disable-next-line no-await-in-loop
			const sanitized = await this.#entityWithSameTypeReferences(binding.source);
			const updatedHash = hash(sanitized);

			binding.source.hash = updatedHash;
			binding.target.hash = updatedHash;
			binding.target.preserveHash = true;
		}
			
		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();
	}

	async #absentOne(
		entry: EntityStorageEntry,
		bindingBag: EntityStorageEntryBindingBag,
	): Promise<void> {
		this.#logger.info(
			`Found a new ${entry.schema.type} in the local storage, adding to the remote storage.`,
		);

		this.#logger.debug(`Bringing dependencies of the ${entry.schema.type} to primary keys...`);
		const noDependencies = await entry.tryBringDependenciesToPrimaryKeys();

		const sanitizedEntity = await this.#entityWithSameTypeReferences(entry);

		bindingBag.add(
			new EntityStorageEntryBinding(
				entry,
				await this.#remoteStorage.new(entry.schema.type, sanitizedEntity),
				noDependencies ? SUBSTITUTE : MERGE,
			),
		);
	}

	async #obsoleteOne(entry: EntityStorageEntry, repair = false): Promise<void> {
		this.#logger.warn(
			`Entity of type ${entry.schema.type} is not found in the remote storage, deleting it from the local as well.`,
		);
		entry.delete();

		if (repair) {
			for await (const dependentEntry of this.#localStorage.all())
				dependentEntry.freeOf(unsafe(entry));
		}
	}

	// eslint-disable-next-line max-statements, max-lines-per-function
	async #pushOneOnFirstRun(
		localEntry: EntityStorageEntry,
		bindingBag: EntityStorageEntryBindingBag,
		force = false,
	): Promise<void> {
		const newHash = hash(localEntry.entity);
		const oldHash = localEntry.hash;

		if (
			localEntry.notHasPrimaryKey ||
			(localEntry.schema.isPrimaryKeyRequired && isUndefined(oldHash))
		) {
			await this.#absentOne(localEntry, bindingBag);
			return;
		}

		if (!force) {
			if (newHash === oldHash) {
				this.#logger.info(
					`The calculated and saved hashes of ${localEntry.schema.type} ${localEntry.preferredUniqueKey} are equal, skipping.`,
				);
				return;
			}
		}

		const remoteEntry = await this.#remoteStorage.one(localEntry.schema.type, localEntry.entity);

		if (isUndefined(remoteEntry)) {
			await this.#obsoleteOne(localEntry, !force);
			return;
		}

		const remoteHash = hash(remoteEntry.entity);

		if (newHash === remoteHash) {
			this.#logger.info(
				`The calculated and remote hashes of ${localEntry.schema.type} ${localEntry.preferredUniqueKey} are the same, skipping.`,
			);
			return;
		}

		if (oldHash === remoteHash) {
			this.#logger.info(
				`The saved and remote hashes of ${localEntry.schema.type} ${localEntry.preferredUniqueKey} are the same, updating remote.`,
			);

			const sanitized = await this.#entityWithSameTypeReferences(localEntry);

			bindingBag.add(
				new EntityStorageEntryBinding(localEntry, remoteEntry.substitute(sanitized)),
			);

			return;
		}

		this.#logger.warn(
			`Conflict detected, the hash of the remote ${localEntry.schema.type} "${remoteHash}" and the saved hash of the local ${localEntry.schema.type} "${oldHash}" don't match, updating local ${localEntry.schema.type}.`,
		);
		localEntry.substitute(remoteEntry.entity);
	}

	async #pushOneOnSecondRun(
		localEntry: EntityStorageEntry,
		remoteEntry: EntityStorageEntry,
		bindingBag: EntityStorageEntryBindingBag,
	): Promise<void> {
		if (!(await localEntry.tryBringDependenciesToPrimaryKeys())) {
			this.#logger.warn(
				`The ${localEntry.schema.type} still has non-primary key dependencies, skipping.`,
			);
			return;
		}

		const newHash = hash(localEntry.entity);
		const remoteHash = hash(remoteEntry.entity);

		if (newHash === remoteHash) {
			this.#logger.info(
				`The hash of the remote ${localEntry.schema.type} and newly calculated of the local ${localEntry.schema.type} is the same "${newHash}", skipping.`,
			);
			return;
		}

		bindingBag.add(
			new EntityStorageEntryBinding(
				localEntry,
				remoteEntry.substitute(await this.#entityWithSameTypeReferences(localEntry)),
			),
		);
	}

	/**
	 * Removes references to other entity types from the entry before pushing to remote.
	 */
	async #entityWithSameTypeReferences(entry: EntityStorageEntry): Promise<Entity> {
		if (!this.#stripCrossTypeReferences) return { ...entry.entity };

		const entity = await entry.getFreeOfNonPrimaryKeyDependeciesEntity();

		return Object.fromEntries(
			Object.entries(entity).filter(([propertyName]) => {
				const propertySchema = entry.schema.properties[propertyName];

				return isUndefined(propertySchema?.reference) || propertySchema.reference === entry.schema.type;
			}),
		);
	}
}
