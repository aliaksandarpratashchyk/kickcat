/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { isUndefined } from 'underscore';

import type LoggerFacade from '../logging/LoggerFacade';
import type Command from './Command';
import type RequestContext from './RequestContext';

import Route from './Route';

/**
 * Route handler grouping a path with its bound commands.
 */
export interface Endpoint {
	commands: Command[];
	route: Route;
}

/**
 * Dispatches CLI routes to registered commands.
 */
export default class Router {
	get endpoints(): Endpoint[] {
		return this.#endpoints;
	}
	readonly #endpoints: Endpoint[] = [];

	readonly #logger: LoggerFacade;

	constructor(logger: LoggerFacade) {
		this.#logger = logger;
	}

	/**
	 * Registers a command for a specific route.
	 */
	add(route: Route, command: Command): this {
		let registered = this.#endpoints.find(
			(endpoint) =>
				endpoint.route === route ||
				(endpoint.route !== Route.unknown &&
					route !== Route.unknown &&
					endpoint.route.path === route.path),
		);

		if (isUndefined(registered)) {
			registered = { commands: [], route };
			this.#endpoints.push(registered);
		}

		if (!registered.commands.includes(command)) registered.commands.push(command);

		return this;
	}

	/**
	 * Processes a request by matching its path and executing commands in order.
	 */
	async dispatch(request: RequestContext): Promise<void> {
		const path: string[] = [];
		let endpoint = this.resolve('');

		for (const rawPart of request.raw) {
			path.push(rawPart);
			endpoint = this.resolve(path.join(' '));

			if (!endpoint.route.hasWildcard) break;
		}

		request.route = endpoint.route;

		for (const command of endpoint.commands) {
			// eslint-disable-next-line no-await-in-loop
			if (!(await command.execute(request, this.#logger))) break;
		}
	}

	/**
	 * Resolves a path to the matching endpoint and aggregated commands.
	 */
	// eslint-disable-next-line max-statements
	resolve(path: string): Endpoint {
		let route = Route.unknown;
		let commands: Command[] = [];
		const unknownEndpoint = this.#endpoints.find(($endpoint) => $endpoint.route === Route.unknown);

		for (const endpoint of this.#endpoints.filter(
			($endpoint) => $endpoint.route !== Route.unknown,
		)) {
			if (endpoint.route.match(path)) {
				if (endpoint.route === Route.any) {
					commands = [...commands, ...endpoint.commands];
					// eslint-disable-next-line no-continue
					continue;
				}

				route = endpoint.route;
				commands = [...commands, ...endpoint.commands];
			}
		}

		if (route === Route.unknown && !isUndefined(unknownEndpoint)) {
			return {
				commands: [...commands, ...unknownEndpoint.commands],
				route: Route.unknown,
			};
		}

		return { commands, route };
	}
}
