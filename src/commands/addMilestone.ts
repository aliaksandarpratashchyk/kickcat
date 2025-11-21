/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { CommandOptions, CommandSchema } from '../cli/CommandSchema';

import schema from '../../schemas/milestones.schema.json';
import numberType from '../cli/NumberType';
import stringType from '../cli/StringType';
import LocalStorage from '../localStorage/LocalStorage';
import { type Milestone } from '../Milestone';

export default async function addMilestone({
	description,
	dueDate,
	number,
	path,
	title,
}: CommandOptions<typeof addMilestone.schema>): Promise<void> {
	const localStorage = new LocalStorage<Milestone>({
		path,
		schema,
	});
	localStorage.new({
		description,
		dueDate,
		number,
		title,
	});

	await localStorage.commit();
}

addMilestone.schema = {
	description: 'Add a new milestone to the local storage.',
	name: 'addMilestone',
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
			type: numberType,
		},
		path: {
			default: '.github/milestones.yml',
			description: 'Path to the milestones file',
			type: stringType,
		},
		title: {
			description: 'Milestone title',
			required: true,
			type: stringType,
		},
	},
} satisfies CommandSchema;
