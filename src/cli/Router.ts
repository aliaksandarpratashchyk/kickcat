/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { isUndefined } from "underscore";
import Route from "./Route";
import type RequestContext from './RequestContext';
import type Command from "./Command";

export interface Endpoint {
    route: Route;
    commands: Command[];
}

export default class Router {
    readonly #endpoints: Endpoint[] = []

    get endpoints(): Endpoint[] {
        return this.#endpoints;
    }

    add(route: Route, command: Command): this {
        let registered = this.#endpoints.find(
            endpoint =>
                endpoint.route === route ||
                (
                    endpoint.route !== Route.unknown &&
                    route !== Route.unknown &&
                    endpoint.route.path === route.path
                ));

        if (isUndefined(registered)) {
            registered = { route, commands: [] }
            this.#endpoints.push(registered);
        }
                    
        if (!registered.commands.includes(command))            
            registered.commands.push(command);        

        return this;
    }

    // eslint-disable-next-line max-statements
    resolve(path: string): Endpoint {
        let route = Route.unknown;
        let commands: Command[] = [];        
        const unknownEndpoint = this.#endpoints.find($endpoint => $endpoint.route === Route.unknown);

        for (const endpoint of this.#endpoints.filter($endpoint => $endpoint.route !== Route.unknown)) {
            if (endpoint.route.match(path)) {
                if (endpoint.route === Route.any) {
                    commands = [ ...commands, ...endpoint.commands ];
                    // eslint-disable-next-line no-continue
                    continue;
                }

                route = endpoint.route;
                commands = [ ...commands, ...endpoint.commands ];
            }
        }

        if (route === Route.unknown && !isUndefined(unknownEndpoint)) {
            return {
                route: Route.unknown,
                commands: [ ...commands, ...unknownEndpoint.commands ],
            };
        }

        return { route, commands };
    }
    
    async dispatch(request: RequestContext): Promise<void> {        
        const path: string[] = [];        
        let endpoint = this.resolve('');

        for (const rawPart of request.raw) {
            path.push(rawPart);
            endpoint = this.resolve(path.join(' '));

            if (!endpoint.route.hasWildcard)
                break;             
        }        

        request.route = endpoint.route;

        for (const command of endpoint.commands) {            
            // eslint-disable-next-line no-await-in-loop
            if (!(await (command.execute(request))))
                break;
        }				            
    }           
}
