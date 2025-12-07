/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type LoggerFacade from '../logging/LoggerFacade';
import type RequestContext from './RequestContext';

import CommandOptionCollection from './CommandOptionCollection';

/**
 * Executable body of a command with parsed options.
 */
export type Action = (options: Record<string, unknown>) => ActionResult;

export type ActionResult = BreakingChainActionResult | NonbreakingChainActionResult;

/**
 * Action result that may stop the middleware chain.
 */
export type BreakingChainActionResult = boolean | Promise<boolean>;

/**
 * Action result that always allows the middleware chain to continue.
 */
export type NonbreakingChainActionResult = Promise<void> | void;

/**
 * Represents a runnable CLI command with options and an action.
 */
export default class Command {
	readonly action: Action;
	readonly description: string;
	readonly options = new CommandOptionCollection();

	constructor(action: Action, description?: string) {
		this.action = action;
		this.description = description ?? 'The command description is missing.';
	}

	/**
	 * Parses incoming options and executes the command action.
	 */
	async execute(request: RequestContext, logger?: LoggerFacade): Promise<boolean> {
		for (const option of this.options) option.parse(request, logger);

		// eslint-disable-next-line no-unneeded-ternary
		return (await this.action(request.options)) === false ? false : true;
	}
}
