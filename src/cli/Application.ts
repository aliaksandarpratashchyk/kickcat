/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import Router from './Router';
import onClause, { type OnClause } from './OnClause';
import type RequestContext from './RequestContext';

export interface ApplicationConfiguration {
	author?: string;	
	description?: string;
	license?: string;
	name: string;
	version?: string;	
}

export default class Application {
	readonly router = new Router();
	readonly configuration: ApplicationConfiguration;
	readonly on: OnClause;

	constructor(configuration: ApplicationConfiguration) {
		this.configuration = configuration;				
		this.on = onClause(this);
	}	
	
	async execute(request: RequestContext): Promise<void> {
		await this.router.dispatch(request);
	}
}
