/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type Application from "./Application";
import { toCommand, type ClassCommandConstructor } from "./ClassCommand";
import type { ClassCommandSchema } from "./ClassCommandSchema";
import Command from "./Command";
import type Route from "./Route";

export default class RouteBinder {
    readonly route: Route;
    readonly application: Application;

	constructor(route: Route, application: Application) {
        this.route = route;
        this.application = application;
    }
    
    use(command: Command): this;
    use<TCommandSchema extends ClassCommandSchema>(classCommandConstructor: ClassCommandConstructor<TCommandSchema>): this
    use(commandOrClassCommandConstructor: ClassCommandConstructor | Command): this {
        this.application.router.add(
            this.route, 
            commandOrClassCommandConstructor instanceof Command ?
            commandOrClassCommandConstructor : 
            toCommand(commandOrClassCommandConstructor));

        return this;
    }    
}
