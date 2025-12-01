/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Logger } from "./Logger";
import type { LogLevel } from "./LogLevel";

export default class CombinedLogger implements Logger {
    readonly #loggers: Logger[];

    constructor(...loggers: Logger[]) {
        this.#loggers = loggers;
    }
    
    writeLine(message: string, level?: LogLevel): void {
        for (const logger of this.#loggers)
            logger.writeLine(message, level);
    }
}