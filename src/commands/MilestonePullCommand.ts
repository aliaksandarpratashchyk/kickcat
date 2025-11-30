/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import numberType from '../cli/NumberType';
import { isUndefined } from 'underscore';
import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import type { EntityStorage } from '../EntityStorage';
import { MILESTONE } from '../EntityType';
import hash from '../hash';

@singleton()
export default class MilestonePullCommand implements ClassCommand<typeof MilestonePullCommand.schema> {
	static readonly schema = {
		description: 'Pull a milestone in the local storage.',		
		parameters: {
			number: {
				description: 'Milestone number',
				type: numberType,
				required: true
			},
		},
	} satisfies ClassCommandSchema;

	readonly #remoteStorage: EntityStorage;
	readonly #localStorage: EntityStorage;	

	constructor(
		@inject('RemoteStorage') remoteCollection: EntityStorage,
		@inject('LocalStorage') localCollection: EntityStorage,
	) {
		this.#remoteStorage = remoteCollection;
		this.#localStorage = localCollection;		
	}

	// eslint-disable-next-line max-statements
	async execute({
		number,
	}: ClassCommandOptions<typeof MilestonePullCommand.schema>): Promise<void> {	
		console.log(`Pulling milestone #${number} from the remote to the local storage.`);

		const remoteMilestone = await this.#remoteStorage.one(MILESTONE, { number });

		if (isUndefined(remoteMilestone)) {
			console.log(`Stopped, cause of error. Can't find milestone #${number} in the remote storage.`);
			throw new Error(`Can't find milestone #${number} in the remote storage.`);
		}			
		
		const localMilestone = await this.#localStorage.one(MILESTONE, { number });

		if (isUndefined(localMilestone)) {
			console.log(`Can't find milestone #${number} in the local storage, adding.`);
			await this.#localStorage.new(MILESTONE, remoteMilestone.entity);
		}
		else {
			console.log(`Updating milestone #${number} in the local storage.`);

			if (!isUndefined(localMilestone.hash) && 
				hash(localMilestone.entity) !== localMilestone.hash)
				console.warn(`The saved hash of the local milestone "${localMilestone.hash}" don't match its calculated hash "${hash(localMilestone.entity)}", milestone probably has not commited local changes, which will be overriten with remote milestone.`);

			localMilestone.change(remoteMilestone.entity);
		}

		console.log(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();
	}
}