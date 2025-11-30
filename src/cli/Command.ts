/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import CommandOptionCollection from "./CommandOptionCollection";
import type RequestContext from './RequestContext';

export type BreakingChainActionResult = Promise<boolean> | boolean;

export type NonbreakingChainActionResult = Promise<void> | void;

export type ActionResult = BreakingChainActionResult | NonbreakingChainActionResult;

export type Action = (options: Record<string, unknown>) => ActionResult;

export default class Command {
    readonly options = new CommandOptionCollection();
    readonly description: string;
    readonly action: Action;

    constructor(action: Action, description?: string) {
        this.action = action;
        this.description = description ?? 'The command description is missing.';
    }

    async execute(request: RequestContext): Promise<boolean> {
        for (const option of this.options)
            option.parse(request);     
        
        // eslint-disable-next-line no-unneeded-ternary
        return (await this.action(request.options) === false) ? false : true;
    }
}