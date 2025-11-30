/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type Application from "./Application";
import Route from "./Route";
import RouteBinder from "./RouteBinder";

export interface OnClause {
    (route: string): RouteBinder;
    any: RouteBinder;
    unknown: RouteBinder;
}

export default function onClause(application: Application): OnClause {
    function invoke(route: string): RouteBinder {
        return new RouteBinder(new Route(route), application);
    }

    invoke.any = new RouteBinder(Route.any, application);
    invoke.unknown = new RouteBinder(Route.unknown, application);

    return invoke;
}
