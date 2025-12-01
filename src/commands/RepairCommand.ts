/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';
import LoggerFacade from '../logging/LoggerFacade';

@singleton()
export default class RepairCommand implements ClassCommand<typeof RepairCommand.schema> {
	static readonly schema = {
		description: 'Repair broken local storage.',		
		parameters: {			
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

	// eslint-disable-next-line no-empty-pattern
	async execute({
		
	}: ClassCommandOptions<typeof RepairCommand.schema>): Promise<void> {		
		this.#logger.info(`Repairing broken local storage...`);
		await this.#localStorage.commit();		
	}
}
