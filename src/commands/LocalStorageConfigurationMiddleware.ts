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
export default class LocalStorageConfigurationMiddleware implements ClassCommand<typeof LocalStorageConfigurationMiddleware.schema> {
	static readonly schema = {
		parameters: {
			localStorage: {
				description: 'Local storage path.',
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
		localStorage
	}: ClassCommandOptions<typeof LocalStorageConfigurationMiddleware.schema>): void {
		this.#logger.info(`Configuring local storage, resolving local storage path...`);

		let storagePath = localStorage;

		if (isUndefined(storagePath) || (typeof storagePath === 'string' && storagePath.trim() === '')) {
			this.#logger.info(`Local storage path with console option is not provided, trying environment variable.`);
			storagePath = process.env['KICKCAT_LOCAL_STORAGE'];
		}

		if (isUndefined(storagePath) || (typeof storagePath === 'string' && storagePath.trim() === '')) {
			this.#logger.info(`Environment variable KICKCAT_LOCAL_STORAGE is not found, backfall to the current working directory.`);
			storagePath = process.cwd();
		}

		this.#logger.info(`Using "${storagePath}" as the local storage path.`);

		container.registerInstance(
			'LocalStorage',
			new LocalStorage(
				storagePath,
				this.#entitySchemaRegistry,
				this.#logger
			),
		);
	}
}
