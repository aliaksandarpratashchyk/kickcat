/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type CommandOption from "./CommandOption";

export default class CommandOptionCollection implements Iterable<CommandOption> {
    readonly #options = new Map<string, CommandOption>();

    get(option: string): CommandOption | undefined {
        return this.#options.get(option);
    }

    add(option: CommandOption): void {
        this.#options.set(option.name, option);
    }

    [Symbol.iterator](): Iterator<CommandOption> {
        return this.#options.values();
    }        
}