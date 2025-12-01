/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import hash from '../hash';
import { isUndefined } from 'underscore';
import type { EntityStorage } from '../EntityStorage';
import { entityTypeType } from '../EntityType';
import LoggerFacade from '../logging/LoggerFacade';

@singleton()
export default class EntityPushAllCommand implements ClassCommand<typeof EntityPushAllCommand.schema> {
	static readonly schema = {
		description: 'Push all labels from the local storage to the remote storage.',
		parameters: {
			of: {
				description: 'Entity type to delete.',
				type: entityTypeType				
			}
		},
	} satisfies ClassCommandSchema;

	readonly #remoteStorage: EntityStorage;
	readonly #localStorage: EntityStorage;
	readonly #logger: LoggerFacade;

	constructor(
		@inject('RemoteStorage') remoteStorage: EntityStorage,
		@inject('LocalStorage') localStorage: EntityStorage,
		@inject(LoggerFacade) logger: LoggerFacade
	) {
		this.#remoteStorage = remoteStorage;
		this.#localStorage = localStorage;
		this.#logger = logger;
	}

	// eslint-disable-next-line max-statements
	async execute({
			of		
		}: ClassCommandOptions<typeof EntityPushAllCommand.schema>): Promise<void> {
		this.#logger.info(`Pushing all entities${of ? ` of type ${of}` : ''} from the local to the remote storage.`);

		for await (const localEntry of this.#localStorage.all(of)) {
			const newHash = hash(localEntry.entity);
			const oldHash = localEntry.hash;

			if (isUndefined(oldHash)) {
				this.#logger.info(`Found a new ${of ?? 'entity'} in the local storage, adding to the remote storage.`);
				await this.#remoteStorage.new(
					localEntry.type, 
					localEntry.entity);
			} else {
				const remoteEntry = await this.#remoteStorage.one(
					localEntry.type, 
					localEntry.entity);

				if (isUndefined(remoteEntry)) {
					this.#logger.warn(`Entity of type ${localEntry.type} is not found in the remote storage, deleting it from the local as well.`);
					localEntry.delete();
				}
				else {					
					const remoteHash = hash(remoteEntry.entity);

					if (newHash === remoteHash)
						this.#logger.info(`The hash of the remote label and newly calculated of the local label is the same "${newHash}", skipping.`);
					else if (oldHash === remoteHash) {						
						this.#logger.info(`The hash of the remote label and the saved hash of the local label is the same "${oldHash}", updating remote label.`);
						remoteEntry.change(localEntry.entity);						
					}
					else {
						this.#logger.warn(`The hash of the remote label "${remoteHash}" and the saved hash of the local label "${oldHash}" don't match, updating local label.`);
						localEntry.change(remoteEntry.entity);
					}
				}
			}
		}

		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();

		this.#logger.info(`Commiting changes to the remote storage.`);
		await this.#remoteStorage.commit();
	}
}
