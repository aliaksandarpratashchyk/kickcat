/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { CommandOptions, CommandSchema } from '../cli/CommandSchema';
import type { Milestone } from '../Milestone';

import schema from '../../schemas/milestones.schema.json';
import stringType from '../cli/StringType';
import GitHubMilestoneStorage from '../GitHubMilestoneStorage';
import hash from '../hash';
import LocalStorage from '../localStorage/LocalStorage';

export default async function pushMilestones({
	owner,
	path,
	repo,
	token,
}: CommandOptions<typeof pushMilestones.schema>): Promise<void> {
	const localStorage = new LocalStorage<Milestone>({
		path,
		schema,
	});
	const remoteStorage = new GitHubMilestoneStorage({ owner, repo, token });

	await localStorage.fetch();

	for (const localStorageEntry of localStorage.all) {
		const newHash = hash(localStorageEntry);
		const oldHash = localStorageEntry.hash ?? '';

		if (typeof localStorageEntry.payload.number === 'undefined') {
			// eslint-disable-next-line no-await-in-loop
			localStorageEntry.change(await remoteStorage.save(localStorageEntry.payload));
		} else {
			// eslint-disable-next-line no-await-in-loop
			const gitHubMilestone = await remoteStorage.find(localStorageEntry.payload.number);

			if (typeof gitHubMilestone === 'undefined') localStorageEntry.delete();
			else {
				const gitHubHash = hash(gitHubMilestone);

				if (newHash !== gitHubHash) {
					// eslint-disable-next-line max-depth
					if (oldHash === gitHubHash) {
						// eslint-disable-next-line no-await-in-loop
						localStorageEntry.change(await remoteStorage.save(localStorageEntry.payload));
					} else {
						localStorageEntry.change(gitHubMilestone);
					}
				}
			}
		}
	}

	await localStorage.commit();
}

pushMilestones.schema = {
	description: 'Synchronize milestones between local storage and GitHub.',
	name: 'pushMilestone',
	parameters: {
		owner: {
			description: 'GitHub repository owner',
			required: true,
			type: stringType,
		},
		path: {
			default: '.github/milestones.yml',
			description: 'Path to the milestones file',
			type: stringType,
		},
		repo: {
			description: 'GitHub repository name',
			required: true,
			type: stringType,
		},
		token: {
			description: 'GitHub Personal Access Token',
			required: true,
			type: stringType,
		},
	},
} satisfies CommandSchema;
