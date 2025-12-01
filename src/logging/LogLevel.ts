/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import LiteralType from "../cli/LiteralType";
import UnionType from "../cli/UnionType";

export const DEBUG = 'debug';

export const INFO = 'info';

export const WARN = 'warn';

export const ERROR = 'error';

export const OFF = 'off';

export type LogLevel = typeof DEBUG | typeof INFO | typeof WARN | typeof ERROR | typeof OFF;

export const logLevelType = new UnionType([
    new LiteralType(DEBUG),
    new LiteralType(INFO),
    new LiteralType(WARN),
    new LiteralType(ERROR),
    new LiteralType(OFF)
]);