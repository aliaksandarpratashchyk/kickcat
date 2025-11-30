/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type Route from "./Route";

export default class RequestContext {
	readonly raw: string[];
	route?: Route;
	readonly options: Record<string, unknown> = {};

	static new(): RequestContext {
		return new RequestContext(process.argv.slice(2));
	}

	constructor(raw: string[]) {
		this.raw = raw;		
	}	
}
