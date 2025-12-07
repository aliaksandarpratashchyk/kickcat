/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { inject, singleton } from 'tsyringe';

import type { ClassCommand } from './ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from './ClassCommandSchema';

import nonNullable from '../nonNullable';
import booleanType from './BooleanType';
import HelpCommand from './HelpCommand';
import RequestContext from './RequestContext';

@singleton()
/**
 * Middleware that intercepts the `--help` flag to render command help.
 */
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
		@inject(RequestContext) request: RequestContext,
	) {
		this.#helpCommand = helpCommand;
		this.#request = request;
	}

	/**
	 * Runs help command when `--help` is provided; otherwise continues chain.
	 */
	execute({ help }: ClassCommandOptions<typeof HelpMiddleware.schema>): boolean {
		if (help === true) {
			this.#helpCommand.execute({ command: nonNullable(this.#request.route).path });
			return false;
		}

		return true;
	}
}
