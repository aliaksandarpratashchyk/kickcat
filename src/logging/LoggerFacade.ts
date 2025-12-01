/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import ConsoleLogger from "./ConsoleLogger";
import type { Logger } from "./Logger";
import { DEBUG, ERROR, INFO, OFF, WARN, type LogLevel } from "./LogLevel";

export default class LoggerFacade {
    readonly #logger: Logger;
    readonly #logLevel: LogLevel;

    constructor(logger?: Logger, logLevel?: LogLevel) {
        this.#logger = logger ?? new ConsoleLogger();
        this.#logLevel = logLevel ?? OFF;
    }

    debug(message: string): void {
        if ([ DEBUG ].includes(this.#logLevel))
            this.#logger.writeLine(message, DEBUG);
    }

    info(message: string): void {
        if ([ DEBUG, INFO ].includes(this.#logLevel))
            this.#logger.writeLine(message, INFO);
    }

    warn(message: string): void {
        if ([ DEBUG, INFO, WARN ].includes(this.#logLevel))
            this.#logger.writeLine(message, WARN);
    }

    error(message: string): void {
        if ([ DEBUG, INFO, WARN, ERROR ].includes(this.#logLevel))
            this.#logger.writeLine(message, ERROR);
    }
}