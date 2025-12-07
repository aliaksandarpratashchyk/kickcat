/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { container } from 'tsyringe';

import type { ClassCommandOptions, ClassCommandSchema } from './ClassCommandSchema';

import Command from './Command';
import CommandOption from './CommandOption';

/**
 * Return type that can short-circuit a middleware chain.
 */
export type BreakingCommandResult = boolean | Promise<boolean>;

/**
 * Interface for class-based commands.
 */
export interface ClassCommand<T extends ClassCommandSchema = ClassCommandSchema> {
	execute: (options: ClassCommandOptions<T>) => MiddlewareResult;
}

export interface ClassCommandConstructor<
	TCommandSchema extends ClassCommandSchema = ClassCommandSchema,
	TCommand extends ClassCommand<TCommandSchema> = ClassCommand<TCommandSchema>,
> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): TCommand;
	schema: TCommandSchema;
}

export type MiddlewareResult = BreakingCommandResult | NonbreakingCommandResult;

/**
 * Return type for middleware that never breaks the chain.
 */
export type NonbreakingCommandResult = Promise<void> | void;

/**
 * Converts a class-based command into a runnable `Command` instance.
 */
export function toCommand(classCommandConstructor: ClassCommandConstructor): Command {
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	const command = new Command((options) => {
		const classCommandInstance = container.resolve(classCommandConstructor);
		return classCommandInstance.execute(options);
	}, classCommandConstructor.schema.description);

	for (const [name, option] of Object.entries(classCommandConstructor.schema.parameters)) {
		command.options.add(
			new CommandOption({
				defaultValue: option.defaultValue,
				description: option.description,
				required: option.required,
				tag: name,
				type: option.type,
			}),
		);
	}

	return command;
}
