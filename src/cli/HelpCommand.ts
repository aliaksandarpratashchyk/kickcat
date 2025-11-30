/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { isString, last, sortBy } from 'underscore';

import Application from './Application';
import type { ClassCommandOptions, ClassCommandSchema } from './ClassCommandSchema';

import stringType from './StringType';
import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from './ClassCommand';
import type CommandOption from './CommandOption';
import nonNullable from '../nonNullable';

@singleton()
export default class HelpCommand implements ClassCommand<typeof HelpCommand.schema> {
	static readonly schema = {
		description: 'Display help information about KickCat commands.',		
		parameters: {
			command: {
				description: 'The command to get help for',
				type: stringType,
			},
		},
	} satisfies ClassCommandSchema;

	readonly #application: Application;	

	constructor(
		@inject(Application) application: Application
	) {
		this.#application = application;		
	}

	execute({
		command,
	}: ClassCommandOptions<typeof HelpCommand.schema>): void {		
		if (isString(command)) {
			this.#printCommandHelp(command);
			return;
		}

		this.#printGeneralHelp();
	}
	
	#printGeneralHelp(): void {
		const entries = this.#application.router.endpoints
			.filter(({ route }) => !route.hasWildcard);

		const commandsList = sortBy(entries, (entry) => entry.route.path)
			.map(({ route, commands }) => {
				const command = nonNullable(last(commands));				
				return `  ${route.path} - ${command.description}`;
			})
			.join('\n');

		console.log(`
${this.#application.configuration.name} ${this.#application.configuration.version ?? ''}
Author: ${this.#application.configuration.author ?? ''}
License: ${this.#application.configuration.license ?? ''}

Description:
${this.#application.configuration.description ?? ''}

Commands:
${commandsList}

For more information on a specific command, use '${this.#application.configuration.name} help --command=[command].`);

	}
		
	#printCommandHelp(path: string): void {
		const { route, commands } = this.#application.router.resolve(path);

		if (commands.length === 0) {
			console.log(`Command "${path}" not found.`);
			return;
		}

		const command = nonNullable(last(commands));

		let options: CommandOption[] = [];

		// eslint-disable-next-line no-underscore-dangle
		for (const _command of commands) {
			options = [ ...options, ...Array.from(_command.options) ];
		}		

		const optionsHelp = sortBy(options, option => option.name)
			.map(option => `  ${option.name} <${option.type.toString()}> - ${option.description}`)
			.join('\n');		

		console.log(`
Command: ${route.path}
Description:
${command.description}
Options: 
${optionsHelp}`);
	}
}
