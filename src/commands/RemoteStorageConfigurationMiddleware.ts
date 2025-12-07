/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { container, inject, singleton } from 'tsyringe';
import { isUndefined } from 'underscore';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import stringType from '../cli/StringType';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import GitHubStorage from '../gitHubStorage/GitHubStorage';
import LocalStorage from '../localStorage/LocalStorage';
import LoggerFacade from '../logging/LoggerFacade';

/**
 * Middleware that configures and registers the remote storage (GitHub or file-based).
 */
@singleton()
export default class RemoteStorageConfigurationMiddleware
	implements ClassCommand<typeof RemoteStorageConfigurationMiddleware.schema>
{
	static readonly schema = {
		parameters: {
			gitHubToken: {
				description: 'GitHub authentication token.',
				type: stringType,
			},
			remoteStorage: {
				description: 'Remote storage path, used for debugging.',
				type: stringType,
			},
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
		gitHubToken,
		remoteStorage,
	}: ClassCommandOptions<typeof RemoteStorageConfigurationMiddleware.schema>): void {
		this.#logger.info(`Configuring remote storage, resolving remote storage path...`);

		let storagePath = remoteStorage;

		if (isUndefined(storagePath)) {
			this.#logger.info(
				`Remote storage path with console option is not provided, trying environment variable.`,
			);
			storagePath = process.env['KICKCAT_REMOTE_STORAGE'];
		}

		if (isUndefined(storagePath)) {
			this.#logger.info(
				`Environment variable KICKCAT_REMOTE_STORAGE is not found, using GitHub as remote storage.`,
			);

			container.registerInstance(
				'RemoteStorage',
				new GitHubStorage({ token: gitHubToken }, this.#entitySchemaRegistry, this.#logger),
			);
		} else {
			this.#logger.warn(`Using file storage by path "${storagePath}" as remote storage.`);

			container.registerInstance(
				'RemoteStorage',
				new LocalStorage({ storagePath, repair: true }, this.#entitySchemaRegistry, this.#logger),
			);
		}
	}
}
