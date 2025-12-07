/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { inject, singleton } from 'tsyringe';
import { isUndefined } from 'underscore';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';
import type { EntityStorage } from '../EntityStorage';

import booleanType from '../cli/BooleanType';
import numberType from '../cli/NumberType';
import stringType from '../cli/StringType';
import UnionType from '../cli/UnionType';
import { entityTypeType } from '../EntityType';
import LoggerFacade from '../logging/LoggerFacade';
import unsafe from '../unsafe';

/**
 * Deletes entities from local storage matching a given key/value filter.
 */
@singleton()
export default class EntityDeleteCommand
	implements ClassCommand<typeof EntityDeleteCommand.schema>
{
	static readonly schema = {
		description: 'Delete an entity from the local storage.',
		parameters: {
			correctDependencies: {
				defaultValue: true,
				description:
					'Also correct all entities depending on the deleted one. Disabling this may lead to dangling references.',
				type: booleanType,
			},
			key: {
				description: 'Key to filter entities to delete.',
				required: true,
				type: stringType,
			},
			of: {
				description: 'Entity type to delete.',
				required: true,
				type: entityTypeType,
			},
			value: {
				description: 'Value to filter entities to delete.',
				required: true,
				type: new UnionType([numberType, stringType]),
			},
		},
	} satisfies ClassCommandSchema;

	readonly #localStorage: EntityStorage;
	readonly #logger: LoggerFacade;

	constructor(
		@inject('LocalStorage') localStorage: EntityStorage,
		@inject(LoggerFacade) logger: LoggerFacade,
	) {
		this.#localStorage = localStorage;
		this.#logger = logger;
	}

	// eslint-disable-next-line max-statements
	async execute({
		correctDependencies,
		key,
		of,
		value,
	}: ClassCommandOptions<typeof EntityDeleteCommand.schema>): Promise<void> {
		this.#logger.info(`Deleting ${of} with ${key} equals to ${value} from the local storage.`);
		const entry = await this.#localStorage.one(of, { [key]: value });

		if (isUndefined(entry)) {
			this.#logger.warn(
				`Skipping, ${of} with ${key} equals to ${value} is not found in the local storage.`,
			);
			return;
		}

		entry.delete();

		if (correctDependencies === true) {
			this.#logger.info(`Correcting dependencies for the deleted entity...`);

			for await (const dependentEntry of this.#localStorage.all())
				dependentEntry.freeOf(unsafe(entry));
		} else this.#logger.warn(`Skipping dependencies correction as per the command option.`);

		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();
	}
}
