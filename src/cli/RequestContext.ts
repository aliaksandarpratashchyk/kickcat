/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type Route from './Route';

/**
 * Carries raw CLI input, parsed options, and resolved route information.
 */
export default class RequestContext {
	readonly options: Record<string, unknown> = {};
	readonly raw: string[];
	route?: Route;

	constructor(raw: string[]) {
		this.raw = raw;
	}

	/**
	 * Creates a new request context from `process.argv`.
	 */
	static new(): RequestContext {
		return new RequestContext(process.argv.slice(2));
	}
}
