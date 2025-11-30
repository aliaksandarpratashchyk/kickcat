/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';

@singleton()
export default class RepairCommand implements ClassCommand<typeof RepairCommand.schema> {
	static readonly schema = {
		description: 'Repair broken local storage.',		
		parameters: {			
		},
	} satisfies ClassCommandSchema;
	
	readonly #localStorage: EntityStorage;

	constructor(		
		@inject('LocalStorage') localStorage: EntityStorage,
	) {		
		this.#localStorage = localStorage;
	}

	// eslint-disable-next-line no-empty-pattern
	async execute({
		
	}: ClassCommandOptions<typeof RepairCommand.schema>): Promise<void> {		
		console.log(`Repairing broken local storage...`);
		await this.#localStorage.commit();		
	}
}
