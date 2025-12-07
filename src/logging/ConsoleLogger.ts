/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Logger } from './Logger';
import type { LogLevel } from './LogLevel';

/**
 * Simple logger that prints messages to stdout.
 */
export default class ConsoleLogger implements Logger {
	/**
	 * Writes a single log line with the level prefix.
	 */
	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	writeLine(message: string, level?: LogLevel): void {
		process.stdout.write(`[${level}]: ${message}\n`);
	}
}
