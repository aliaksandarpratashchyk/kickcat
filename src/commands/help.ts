/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { sortBy } from 'underscore';

import type Application from '../cli/Application';
import type { CommandOptions } from '../cli/CommandSchema';

import stringType from '../cli/StringType';
import kebab from '../kebab';

export default function help(
	{ command }: CommandOptions<typeof help.schema>,
	application: Application,
): void {
	if (typeof command === 'string') {
		const definition = application.configuration.commands.find(
			(action) => kebab(action.schema.name) === command,
		);

		if (definition) {
			console.log(`
Command: ${kebab(definition.schema.name)}
Description: ${definition.schema.description}
Options: 
${sortBy(Object.entries(definition.schema.parameters), ([parameterName]) => parameterName)
	.map(
		([parameterName, parameterSchema]) =>
			`  ${kebab(parameterName)} - ${parameterSchema.description}`,
	)
	.join('\n  ')}`);
		} else {
			console.log(`Command "${command}" not found.`);
		}
		return;
	}

	console.log(`
${application.configuration.name} ${application.configuration.version}
Author: ${application.configuration.author}
License: ${application.configuration.license}

Description:
${application.configuration.description}

Commands:
${sortBy(application.configuration.commands, (action) => action.schema.name)
	.map((action) => `  ${kebab(action.name)} - ${action.schema.description}`)
	.join('\n')}

For more information on a specific command, use '${application.configuration.name} help --command=[command].`);
}

help.schema = {
	description: 'Display help information about KickHub commands.',
	name: 'help',
	parameters: {
		command: {
			description: 'The command to get help for',
			type: stringType,
		},
	},
};
