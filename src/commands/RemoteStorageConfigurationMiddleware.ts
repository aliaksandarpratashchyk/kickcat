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

@singleton()
export default class RemoteStorageConfigurationMiddleware implements ClassCommand<typeof RemoteStorageConfigurationMiddleware.schema> {
	static readonly schema = {
		parameters: {
			remoteStorage: {
				description: 'Remote storage path, used for debugging.',
				type: stringType
			},
		},
	} satisfies ClassCommandSchema;	

	readonly #entitySchemaRegistry: EntitySchemaRegistry;

	constructor(		
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
	) {		
		this.#entitySchemaRegistry = entitySchemaRegistry;
	}
			
	execute({
		remoteStorage
	}: ClassCommandOptions<typeof RemoteStorageConfigurationMiddleware.schema>): void {
		console.log(`Configuring remote storage, resolving remote storage path...`);

		let storagePath = remoteStorage;

		if (isUndefined(storagePath)) {
			console.log(`Remote storage path with console option is not provided, trying environment variable.`);
			storagePath = process.env['KICKCAT_REMOTE_STORAGE'];
		}		

		if (isUndefined(storagePath)) {
			console.log(`Environment variable KICKCAT_REMOTE_STORAGE is not found, using GitHub as remote storage.`);
			throw new Error(`// TODO: GitHub remote storage binding.`);			
		}
		else {					
			console.warn(`Using file storage by path "${storagePath}" as remote storage.`);

			container.registerInstance(
				'RemoteStorage', 
				new LocalStorage(
					storagePath, 
					this.#entitySchemaRegistry
				),
			);
		}		
	}
}
