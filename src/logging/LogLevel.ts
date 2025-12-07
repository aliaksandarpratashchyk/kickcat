/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import LiteralType from '../cli/LiteralType';
import UnionType from '../cli/UnionType';

/**
 * Log level for verbose debugging output.
 */
export const DEBUG = 'debug';

/**
 * Log level for informational messages.
 */
export const INFO = 'info';

/**
 * Log level for non-fatal warnings.
 */
export const WARN = 'warn';

/**
 * Log level for errors.
 */
export const ERROR = 'error';

/**
 * Log level that disables logging.
 */
export const OFF = 'off';

/**
 * Union of supported log levels.
 */
export type LogLevel = typeof DEBUG | typeof ERROR | typeof INFO | typeof OFF | typeof WARN;

/**
 * CLI type for parsing log levels.
 */
export const logLevelType = new UnionType([
	new LiteralType(DEBUG),
	new LiteralType(INFO),
	new LiteralType(WARN),
	new LiteralType(ERROR),
	new LiteralType(OFF),
]);
