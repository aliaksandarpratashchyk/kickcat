/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { isUndefined } from 'underscore';
import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';
import { entityTypeType } from '../EntityType';
import hash from '../hash';
import LoggerFacade from '../logging/LoggerFacade';
import stringType from '../cli/StringType';
import UnionType from '../cli/UnionType';
import numberType from '../cli/NumberType';

@singleton()
export default class EntityPullCommand implements ClassCommand<typeof EntityPullCommand.schema> {
	static readonly schema = {
		description: 'Pull an entity into the local storage.',		
		parameters: {
			of: {
				description: 'Entity type to pull.',
				type: entityTypeType,
				required: true
			},
			key: {
				description: 'Key to filter entities to pull.',
				type: stringType,
				required: true
			},	
			value: {
				description: 'Value to filter entities to pull.',
				type: new UnionType([ numberType, stringType]),
				required: true
			}
		},
	} satisfies ClassCommandSchema;

	readonly #remoteStorage: EntityStorage;
	readonly #localStorage: EntityStorage;	
	readonly #logger: LoggerFacade;

	constructor(
		@inject('RemoteStorage') remoteCollection: EntityStorage,
		@inject('LocalStorage') localCollection: EntityStorage,
		@inject(LoggerFacade) logger: LoggerFacade
	) {
		this.#remoteStorage = remoteCollection;
		this.#localStorage = localCollection;	
		this.#logger = logger;	
	}

	// eslint-disable-next-line max-statements
	async execute({
		of,
		key,
		value
	}: ClassCommandOptions<typeof EntityPullCommand.schema>): Promise<void> {	
		this.#logger.info(`Pulling ${of} with ${key} equals to ${value} from the remote to the local storage.`);

		const remoteEntry = await this.#remoteStorage.one(of, { [key]: value });

		if (isUndefined(remoteEntry)) {
			this.#logger.info(`Stopped, cause of an error. Can't find ${of} with ${key} equals to ${value} in the remote storage.`);
			throw new Error(`Can't find ${of} with ${key} equals to "${value}" in the remote storage.`);
		}			
		
		const localEntry = await this.#localStorage.one(of, { [key]: value });
		
		if (isUndefined(localEntry)) {
			this.#logger.info(`Can't find ${of} with ${key} equals to ${value} in the local storage, adding.`);
			await this.#localStorage.new(of, remoteEntry.entity);
		}
		else {
			this.#logger.info(`Updating ${of} with ${key} equals to "${value}" in the local storage.`);

			if (!isUndefined(localEntry.hash) && 
				hash(localEntry.entity) !== localEntry.hash)
				this.#logger.warn(`The saved hash of the local ${of} "${localEntry.hash}" don't match its calculated hash "${hash(localEntry.entity)}", milestone probably has not commited local changes, which will be overriten with remote label.`);

			localEntry.change(remoteEntry.entity);
		}

		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();
	}
}