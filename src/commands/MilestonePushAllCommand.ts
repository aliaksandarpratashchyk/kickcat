/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandSchema } from '../cli/ClassCommandSchema';

import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import hash from '../hash';
import { isUndefined } from 'underscore';
import type { EntityStorage } from '../EntityStorage';
import { MILESTONE } from '../EntityType';
import type { Milestone } from '../Milestone';

@singleton()
export default class MilestonePushAllCommand implements ClassCommand<typeof MilestonePushAllCommand.schema> {
	static readonly schema = {
		description: 'Push all milestones from the local storage to GitHub.',
		parameters: {
		},
	} satisfies ClassCommandSchema;

	readonly #remoteStorage: EntityStorage;
	readonly #localStorage: EntityStorage;

	constructor(
		@inject('RemoteStorage') remoteStorage: EntityStorage,
		@inject('LocalStorage') localStorage: EntityStorage
	) {
		this.#remoteStorage = remoteStorage;
		this.#localStorage = localStorage;
	}

	// eslint-disable-next-line max-statements
	async execute(): Promise<void> {
		console.log(`Pushing all milestones from the local to the remote storage.`);

		for await (const localMilestone of this.#localStorage.all<Milestone>(MILESTONE)) {
			const newHash = hash(localMilestone.entity);
			const oldHash = localMilestone.hash ?? '';

			if (isUndefined(localMilestone.entity.number)) {
				console.log(`Found a new milestone "${localMilestone.entity.title}" in the local storage, adding to the remote storage.`);
				await this.#remoteStorage.new(MILESTONE, localMilestone.entity);
			} else {
				const remoteMilestone = await this.#remoteStorage.one<Milestone>(MILESTONE, { number: localMilestone.entity.number });

				if (isUndefined(remoteMilestone)) {
					console.warn(`Milestone #${localMilestone.entity.number} is not found in the remote storage, deleting it from the local as well.`);
					localMilestone.delete();
				}
				else {					
					const remoteHash = hash(remoteMilestone.entity);

					if (newHash === remoteHash)
						console.log(`The hash of the remote milestone and newly calculated of the local milestone is the same "${newHash}", skipping.`);
					else if (oldHash === remoteHash) {						
						console.log(`The hash of the remote milestone and the saved hash of the local milestone is the same "${oldHash}", updating remote milestone.`);
						remoteMilestone.change(localMilestone.entity);						
					}
					else {
						console.warn(`The hash of the remote milestone "${remoteHash}" and the saved hash of the local milestone "${oldHash}" don't match, updating local miletone.`);
						localMilestone.change(remoteMilestone.entity);
					}
				}
			}
		}

		console.log(`Commiting changes to the local storage.`);
		await this.#localStorage.commit();

		console.log(`Commiting changes to the remote storage.`);
		await this.#remoteStorage.commit();
	}
}
