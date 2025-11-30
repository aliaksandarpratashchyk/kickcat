/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from './ClassCommandSchema';
import { inject, singleton } from 'tsyringe';
import type { ClassCommand } from './ClassCommand';
import booleanType from './BooleanType';
import HelpCommand from './HelpCommand';
import RequestContext from './RequestContext';
import nonNullable from '../nonNullable';

@singleton()
export default class HelpMiddleware implements ClassCommand<typeof HelpMiddleware.schema> {
	static readonly schema = {		
		parameters: {
			help: {
				description: 'Displays help for a command.',
				type: booleanType,
			},
		},
	} satisfies ClassCommandSchema;

	readonly #helpCommand: HelpCommand;
	readonly #request: RequestContext;

	constructor(
		@inject(HelpCommand) helpCommand: HelpCommand,
		@inject(RequestContext) request: RequestContext
	) {
		this.#helpCommand = helpCommand;
		this.#request = request;
	}

	execute({
		help,
	}: ClassCommandOptions<typeof HelpMiddleware.schema>): boolean {
		if (help === true) {
			this.#helpCommand.execute({ command: nonNullable(this.#request.route).path });
			return false;
		}

		return true;
	}	
}
