/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import Router from './Router';
import onClause, { type OnClause } from './OnClause';
import type RequestContext from './RequestContext';
import LoggerFacade from '../logging/LoggerFacade';
import { inject } from 'tsyringe';
import ConsoleLogger from '../logging/ConsoleLogger';

export interface ApplicationConfiguration {
	author?: string;	
	description?: string;
	license?: string;
	name: string;
	version?: string;	
}

export default class Application {	
	readonly configuration: ApplicationConfiguration;
	readonly on: OnClause;
	readonly #logger: LoggerFacade;
	readonly router: Router;

	constructor(
		configuration: ApplicationConfiguration, 
		@inject(LoggerFacade) logger?: LoggerFacade
	) {
		this.configuration = configuration;				
		this.on = onClause(this);
		this.#logger = logger ?? new LoggerFacade(new ConsoleLogger());
		this.router = new Router(this.#logger);
	}	
	
	async execute(request: RequestContext): Promise<void> {
		await this.router.dispatch(request);
	}
}
