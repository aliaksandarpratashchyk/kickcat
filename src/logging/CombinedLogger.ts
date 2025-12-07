/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Logger } from './Logger';
import type { LogLevel } from './LogLevel';

/**
 * Logger that fan-outs log messages to multiple underlying loggers.
 */
export default class CombinedLogger implements Logger {
	readonly #loggers: Logger[];

	constructor(...loggers: Logger[]) {
		this.#loggers = loggers;
	}

	/**
	 * Writes the message to every registered logger.
	 */
	writeLine(message: string, level?: LogLevel): void {
		for (const logger of this.#loggers) logger.writeLine(message, level);
	}
}
