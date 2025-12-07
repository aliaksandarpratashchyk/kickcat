/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { resolve } from 'path';
import { container, inject, singleton } from 'tsyringe';
import { isUndefined } from 'underscore';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import stringType from '../cli/StringType';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import LocalStorage from '../localStorage/LocalStorage';
import LoggerFacade from '../logging/LoggerFacade';
import booleanType from '../cli/BooleanType';

/**
 * Middleware that configures the local storage path and registers the storage implementation.
 */
@singleton()
export default class LocalStorageConfigurationMiddleware
	implements ClassCommand<typeof LocalStorageConfigurationMiddleware.schema>
{
	static readonly schema = {
		parameters: {
			localStorage: {
				description: 'Local storage path.',
				type: stringType,
			},
			repair: {
				description: 'Repair local storage if corrupted.',
				type: booleanType,
				defaultValue: false,
			}
		},
	} satisfies ClassCommandSchema;

	readonly #entitySchemaRegistry: EntitySchemaRegistry;
	readonly #logger: LoggerFacade;

	constructor(
		@inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry,
		@inject(LoggerFacade) logger: LoggerFacade,
	) {
		this.#entitySchemaRegistry = entitySchemaRegistry;
		this.#logger = logger;
	}

	execute({
		localStorage,
		repair
	}: ClassCommandOptions<typeof LocalStorageConfigurationMiddleware.schema>): void {
		this.#logger.info(`Configuring local storage, resolving local storage path...`);

		let storagePath = localStorage;

		if (
			isUndefined(storagePath) ||
			(typeof storagePath === 'string' && storagePath.trim() === '')
		) {
			this.#logger.info(
				`Local storage path with console option is not provided, trying environment variable.`,
			);
			storagePath = process.env['KICKCAT_LOCAL_STORAGE'];
		}

		if (
			isUndefined(storagePath) ||
			(typeof storagePath === 'string' && storagePath.trim() === '')
		) {
			this.#logger.info(
				`Environment variable KICKCAT_LOCAL_STORAGE is not found, backfall to the current working directory.`,
			);
			storagePath = resolve(process.cwd(), '.github');
		}

		this.#logger.info(`Using "${storagePath}" as the local storage path.`);

		container.registerInstance(
			'LocalStorage',
			new LocalStorage({ storagePath, repair }, this.#entitySchemaRegistry, this.#logger),
		);
	}
}
