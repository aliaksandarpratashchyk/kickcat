/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type Application from './Application';
import type { ClassCommandSchema } from './ClassCommandSchema';
import type Route from './Route';

import { type ClassCommandConstructor, toCommand } from './ClassCommand';
import Command from './Command';

/**
 * Fluent binder that attaches commands to a specific route.
 */
export default class RouteBinder {
	readonly application: Application;
	readonly route: Route;

	constructor(route: Route, application: Application) {
		this.route = route;
		this.application = application;
	}

	/**
	 * Registers a command or command class for this route.
	 */
	use(command: Command): this;
	use<TCommandSchema extends ClassCommandSchema>(
		classCommandConstructor: ClassCommandConstructor<TCommandSchema>,
	): this;
	use(commandOrClassCommandConstructor: ClassCommandConstructor | Command): this {
		this.application.router.add(
			this.route,
			commandOrClassCommandConstructor instanceof Command
				? commandOrClassCommandConstructor
				: toCommand(commandOrClassCommandConstructor),
		);

		return this;
	}
}
