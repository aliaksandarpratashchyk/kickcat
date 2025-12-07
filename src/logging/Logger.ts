/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { LogLevel } from './LogLevel';

/**
 * Abstraction over log writers used by KickCat.
 */
export interface Logger {
	writeLine: (message: string, level?: LogLevel) => void;
}
