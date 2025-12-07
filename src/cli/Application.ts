/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { inject } from 'tsyringe';

import type RequestContext from './RequestContext';

import ConsoleLogger from '../logging/ConsoleLogger';
import LoggerFacade from '../logging/LoggerFacade';
import onClause, { type OnClause } from './OnClause';
import Router from './Router';

/**
 * Metadata and configuration for a KickCat CLI application.
 */
export interface ApplicationConfiguration {
	author?: string;
	description?: string;
	license?: string;
	name: string;
	version?: string;
}

/**
 * Entry point for configuring commands and dispatching requests.
 */
export default class Application {
	readonly configuration: ApplicationConfiguration;
	readonly on: OnClause;
	readonly router: Router;
	readonly #logger: LoggerFacade;

	constructor(
		configuration: ApplicationConfiguration,
		@inject(LoggerFacade) logger?: LoggerFacade,
	) {
		this.configuration = configuration;
		this.on = onClause(this);
		this.#logger = logger ?? new LoggerFacade(new ConsoleLogger());
		this.router = new Router(this.#logger);
	}

	/**
	 * Dispatches an incoming request through the router.
	 */
	async execute(request: RequestContext): Promise<void> {
		await this.router.dispatch(request);
	}
}
