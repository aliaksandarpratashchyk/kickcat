/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import numberType from '../cli/NumberType';
import { type Milestone } from '../Milestone';
import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';
import { MILESTONE } from '../EntityType';
import { isUndefined } from 'underscore';

@singleton()
export default class MilestoneDeleteCommand implements ClassCommand<typeof MilestoneDeleteCommand.schema> {
	static readonly schema = {
		description: 'Delete a milestone from the local storage.',		
		parameters: {
			number: {
				description: 'Milestone number',
				type: numberType,
				required: true
			}
		},
	} satisfies ClassCommandSchema;
	
	readonly #localStorage: EntityStorage;

	constructor(		
		@inject('LocalStorage') localStorage: EntityStorage,
	) {		
		this.#localStorage = localStorage;
	}

	async execute({
		number,
	}: ClassCommandOptions<typeof MilestoneDeleteCommand.schema>): Promise<void> {
		console.log(`Deleting milestone #${number} from the local storage.`);
		const milestone = await this.#localStorage.one<Milestone>(MILESTONE, { number });

		if (isUndefined(milestone)) {			
			console.warn(`Skipping, milestone #${number} is not found in the local storage.`);
			return;
		}
					
		milestone.delete();

		console.log(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();		
	}
}
