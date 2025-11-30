/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { container } from 'tsyringe';
import type { ClassCommandOptions, ClassCommandSchema } from './ClassCommandSchema';
import Command from './Command';
import CommandOption from './CommandOption';

export type BreakingCommandResult = Promise<boolean> | boolean;

export type NonbreakingCommandResult = Promise<void> | void;

export type MiddlewareResult = BreakingCommandResult | NonbreakingCommandResult;

export interface ClassCommand<T extends ClassCommandSchema = ClassCommandSchema> {
	execute: (options: ClassCommandOptions<T>) => MiddlewareResult;
}

export interface ClassCommandConstructor<
	TCommandSchema extends ClassCommandSchema = ClassCommandSchema,
	TCommand extends ClassCommand<TCommandSchema> = ClassCommand<TCommandSchema>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new(...args: any[]): TCommand;
	schema: TCommandSchema;
}

export function toCommand(classCommandConstructor: ClassCommandConstructor): Command {
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	const command = new Command((options) => {
		const classCommandInstance = container.resolve(classCommandConstructor);
		return classCommandInstance.execute(options);
	}, classCommandConstructor.schema.description);

	for (const [name, option] of Object.entries(classCommandConstructor.schema.parameters)) {
		command.options.add(new CommandOption({
			tag: name,
			type: option.type,
			description: option.description,
			required: option.required,
			defaultValue: option.defaultValue
		}));
	}

	return command;
}
