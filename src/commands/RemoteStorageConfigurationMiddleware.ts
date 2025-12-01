/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import stringType from '../cli/StringType';
import { container, inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import LocalStorage from '../localStorage/LocalStorage';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import { isUndefined } from 'underscore';
import LoggerFacade from '../logging/LoggerFacade';

@singleton()
export default class RemoteStorageConfigurationMiddleware implements ClassCommand<typeof RemoteStorageConfigurationMiddleware.schema> {
	static readonly schema = {
		parameters: {
			remoteStorage: {
				description: 'Remote storage path, used for debugging.',
				type: stringType
			},
			gitHubToken: {
				description: 'GitHub authentication token.',
				type: stringType
			},
		},
	} satisfies ClassCommandSchema;	

	readonly #entitySchemaRegistry: EntitySchemaRegistry;
	readonly #logger: LoggerFacade;

	constructor(		
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
		@inject(LoggerFacade) logger: LoggerFacade
	) {		
		this.#entitySchemaRegistry = entitySchemaRegistry;
		this.#logger = logger;
	}
				
	execute({
		remoteStorage
	}: ClassCommandOptions<typeof RemoteStorageConfigurationMiddleware.schema>): void {
		this.#logger.info(`Configuring remote storage, resolving remote storage path...`);

		let storagePath = remoteStorage;

		if (isUndefined(storagePath)) {
			this.#logger.info(`Remote storage path with console option is not provided, trying environment variable.`);
			storagePath = process.env['KICKCAT_REMOTE_STORAGE'];
		}		

		if (isUndefined(storagePath)) {
			this.#logger.info(`Environment variable KICKCAT_REMOTE_STORAGE is not found, using GitHub as remote storage.`);			
			throw new Error(`// TODO: GitHub remote storage binding.`);			
		}
		else {					
			this.#logger.warn(`Using file storage by path "${storagePath}" as remote storage.`);

			container.registerInstance(
				'RemoteStorage', 
				new LocalStorage(
					storagePath, 
					this.#entitySchemaRegistry,
					this.#logger
				),
			);
		}		
	}
}
