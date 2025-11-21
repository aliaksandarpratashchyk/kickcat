/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type Application from './Application';
import type { CommandOptions, CommandSchema } from './CommandSchema';

export interface Command<T extends CommandSchema = CommandSchema> {
	(options: CommandOptions<T>, application: Application): Promise<void> | void;
	schema: T;
}

export function command<T extends CommandSchema>(action: Command<T>): Command {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	return action as unknown as Command;
}
