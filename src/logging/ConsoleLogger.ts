/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Logger } from "./Logger";
import type { LogLevel } from "./LogLevel";

export default class ConsoleLogger implements Logger {
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    writeLine(message: string, level?: LogLevel): void {
        process.stdout.write(`[${level}]: ${message}\n`);
    }
}