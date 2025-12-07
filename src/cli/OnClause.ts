/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type Application from './Application';

import Route from './Route';
import RouteBinder from './RouteBinder';

/**
 * Fluent interface for binding routes to commands/middleware.
 */
export interface OnClause {
	(route: string): RouteBinder;
	any: RouteBinder;
	unknown: RouteBinder;
}

/**
 * Creates the `on` clause helper bound to an application router.
 */
export default function onClause(application: Application): OnClause {
	function invoke(route: string): RouteBinder {
		return new RouteBinder(new Route(route), application);
	}

	invoke.any = new RouteBinder(Route.any, application);
	invoke.unknown = new RouteBinder(Route.unknown, application);

	return invoke;
}
