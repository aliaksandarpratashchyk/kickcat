/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';
import { entityTypeType } from '../EntityType';
import { isUndefined } from 'underscore';
import LoggerFacade from '../logging/LoggerFacade';
import stringType from '../cli/StringType';
import UnionType from '../cli/UnionType';
import numberType from '../cli/NumberType';

@singleton()
export default class EntityDeleteCommand implements ClassCommand<typeof EntityDeleteCommand.schema> {
	static readonly schema = {
		description: 'Delete an entity from the local storage.',		
		parameters: {
			of: {
				description: 'Entity type to delete.',
				type: entityTypeType,
				required: true
			},
			key: {
				description: 'Key to filter entities to delete.',
				type: stringType,
				required: true
			},	
			value: {
				description: 'Value to filter entities to delete.',
				type: new UnionType([ numberType, stringType]),
				required: true
			}
		},	
	} satisfies ClassCommandSchema;
	
	readonly #localStorage: EntityStorage;
	readonly #logger: LoggerFacade;

	constructor(		
		@inject('LocalStorage') localStorage: EntityStorage,
		@inject(LoggerFacade) logger: LoggerFacade
	) {		
		this.#localStorage = localStorage;
		this.#logger = logger;
	}

	async execute({
		of,
		key,
		value
	}: ClassCommandOptions<typeof EntityDeleteCommand.schema>): Promise<void> {
		this.#logger.info(`Deleting ${of} with ${key} equals to ${value} from the local storage.`);
		const entry = await this.#localStorage.one(of, { [key]: value });

		if (isUndefined(entry)) {			
			this.#logger.warn(`Skipping, ${of} with ${key} equals to ${value} is not found in the local storage.`);
			return;
		}
					
		entry.delete();

		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();		
	}
}
