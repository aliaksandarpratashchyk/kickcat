/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { CommandOptions, CommandSchema } from '../cli/CommandSchema';

import schema from '../../schemas/milestones.schema.json';
import numberType from '../cli/NumberType';
import stringType from '../cli/StringType';
import GitHubMilestoneStorage from '../GitHubMilestoneStorage';
import LocalStorage from '../localStorage/LocalStorage';
import { type Milestone } from '../Milestone';
import { CLOSED, OPEN } from '../MilestoneState';

// eslint-disable-next-line max-lines-per-function
export default async function pullMilestone({
	description,
	dueDate,
	number,
	owner,
	path,
	repo,
	state,
	title,
	token,
}: CommandOptions<typeof pullMilestone.schema>): Promise<void> {
	if (typeof state === 'string' && !(state === OPEN || state === CLOSED))
		throw new Error(`Invalid state value.`);

	const localStorage = new LocalStorage<Milestone>({
		path,
		schema,
	});
	await localStorage.fetch();

	//
	// Removing possible dublicates
	//
	Array.from(localStorage.all)
		.filter((milestone) => milestone.payload.number === number)
		.forEach((milestone) => {
			milestone.delete();
		});

	const updated = Array.from(localStorage.all).find(
		(milestone) => milestone.payload.number === number,
	);

	if (updated) {
		updated.change({
			description: description ?? updated.payload.description,
			dueDate: dueDate ?? updated.payload.dueDate,
			state: state ?? updated.payload.state,
			title,
		});
	} else {
		// eslint-disable-next-line no-lonely-if
		if (
			typeof token !== 'undefined' &&
			typeof repo !== 'undefined' &&
			typeof owner !== 'undefined'
		) {
			const remoteStorage = new GitHubMilestoneStorage({
				owner,
				repo,
				token,
			});

			const payload = await remoteStorage.find(number);

			if (payload) localStorage.new(payload);
		} else {
			localStorage.new({
				description,
				dueDate,
				number,
				state,
				title,
			});
		}
	}

	await localStorage.commit();
}

pullMilestone.schema = {
	description: 'Add a new milestone to the local storage.',
	name: 'pullMilestone',
	parameters: {
		description: {
			description: 'Milestone description',
			type: stringType,
		},
		dueDate: {
			description: 'Milestone due date',
			type: stringType,
		},
		number: {
			description: 'Milestone number',
			required: true,
			type: numberType,
		},
		owner: {
			description: 'GitHub repository owner',
			type: stringType,
		},
		path: {
			default: '.github/milestones.yml',
			description: 'Path to the milestones file',
			type: stringType,
		},
		repo: {
			description: 'GitHub repository name',
			type: stringType,
		},
		state: {
			description: '',
			type: stringType,
		},
		title: {
			description: 'Milestone title',
			required: true,
			type: stringType,
		},
		token: {
			description: 'GitHub Personal Access Token',
			type: stringType,
		},
	},
} satisfies CommandSchema;
