/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Command } from './Command';

import camel from '../camel';
import kebab from '../kebab';
import booleanType from './BooleanType';

export interface ApplicationConfiguration {
	author?: string;
	commands: Command[];
	description?: string;
	license?: string;
	name: string;
	version?: string;
}

const OPTION_REGEX = /^--(?<key>[A-Za-z0-9_-]+)(?:=(?<value>(?:"[^"]*"|'[^']*'|[^"']+)))?$/u;

export default class Application {
	readonly configuration: ApplicationConfiguration;

	constructor(configuration: ApplicationConfiguration) {
		this.configuration = configuration;
	}

	// eslint-disable-next-line max-statements
	async executeCommand(): Promise<void> {
		const command = this.#getCommand(process.argv[2] ?? 'help');

		if (typeof command === 'undefined') throw new Error(`Command "${process.argv[2]}" is unknown.`);

		const options: Record<string, unknown> = {};

		for (const arg of process.argv.slice(3)) {
			const match = OPTION_REGEX.exec(arg);

			if (!match) throw new Error(`Incorrect option format ${arg}.`);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
			const { key, value } = match.groups as { key: string; value?: string };

			const parameterName = camel(key);
			const parameter = command.schema.parameters[parameterName];

			if (typeof parameter === 'undefined') throw new Error(`Parameter "${key}" is unknown.`);

			if (parameter.type === booleanType && value === '') options[parameterName] = true;
			else options[parameterName] = parameter.type.parse(value ?? '');
		}

		for (const [parameterName, parameter] of Object.entries(command.schema.parameters)) {
			if (parameter.required === true && typeof options[parameterName] === 'undefined')
				throw new Error(`Parameter "${parameterName}" is required.`);
		}

		await command(options, this);
	}

	#getCommand(name: string): Command | undefined {
		return this.configuration.commands.find((command) => kebab(command.schema.name) === name);
	}
}
