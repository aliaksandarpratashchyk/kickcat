/**
 * KickCat v0.4.0
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
import booleanType from '../cli/BooleanType';
import unsafe from '../unsafe';

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
			},
			correctDependencies: {
				description: 'Also correct all entities depending on the deleted one. Disabling this may lead to dangling references.',
				type: booleanType,
				defaultValue: true				
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

	// eslint-disable-next-line max-statements
	async execute({
		of,
		key,
		value,
		correctDependencies
	}: ClassCommandOptions<typeof EntityDeleteCommand.schema>): Promise<void> {
		this.#logger.info(`Deleting ${of} with ${key} equals to ${value} from the local storage.`);
		const entry = await this.#localStorage.one(of, { [key]: value });

		if (isUndefined(entry)) {			
			this.#logger.warn(`Skipping, ${of} with ${key} equals to ${value} is not found in the local storage.`);
			return;
		}
					
		entry.delete();

		if (correctDependencies === true) {
			this.#logger.info(`Correcting dependencies for the deleted entity...`);
		
			for await (const dependentEntry of this.#localStorage.all())
				dependentEntry.freeOf(unsafe(entry));	
		}
		else 
			this.#logger.warn(`Skipping dependencies correction as per the command option.`);

		this.#logger.info(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();		
	}
}
