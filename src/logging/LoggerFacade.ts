/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Logger } from './Logger';

import ConsoleLogger from './ConsoleLogger';
import { DEBUG, ERROR, INFO, type LogLevel, OFF, WARN } from './LogLevel';

/**
 * Facade that filters log output based on the configured log level.
 */
export default class LoggerFacade {
	readonly #logger: Logger;
	readonly #logLevel: LogLevel;

	constructor(logger?: Logger, logLevel?: LogLevel) {
		this.#logger = logger ?? new ConsoleLogger();
		this.#logLevel = logLevel ?? OFF;
	}

	debug(message: string): void {
		if ([DEBUG].includes(this.#logLevel)) this.#logger.writeLine(message, DEBUG);
	}

	error(message: string): void {
		if ([DEBUG, ERROR, INFO, WARN].includes(this.#logLevel)) this.#logger.writeLine(message, ERROR);
	}

	info(message: string): void {
		if ([DEBUG, INFO].includes(this.#logLevel)) this.#logger.writeLine(message, INFO);
	}

	warn(message: string): void {
		if ([DEBUG, INFO, WARN].includes(this.#logLevel)) this.#logger.writeLine(message, WARN);
	}
}
