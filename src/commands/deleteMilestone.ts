/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { CommandOptions } from '../cli/CommandSchema';
import type { Milestone } from '../Milestone';

import schema from '../../schemas/milestones.schema.json';
import numberType from '../cli/NumberType';
import stringType from '../cli/StringType';
import LocalStorage from '../localStorage/LocalStorage';

export default async function deleteMilestone({
	number,
	path,
}: CommandOptions<typeof deleteMilestone.schema>): Promise<void> {
	const localStorage = new LocalStorage<Milestone>({
		path,
		schema,
	});
	await localStorage.fetch();

	Array.from(localStorage.all)
		.filter((milestone) => milestone.payload.number === number)
		.forEach((milestone) => {
			milestone.delete();
		});

	await localStorage.commit();
}

deleteMilestone.schema = {
	description: 'Delete a milestone from the local storage.',
	name: 'deleteMilestone',
	parameters: {
		number: {
			description: 'Milestone number',
			type: numberType,
		},
		path: {
			default: '.github/milestones.yml',
			description: 'Path to the milestones file',
			type: stringType,
		},
	},
};
