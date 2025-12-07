/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type { Type, ValueType } from './Type';

/**
 * Strongly typed options bag built from a command schema.
 */
export type ClassCommandOptions<T extends ClassCommandSchema> = {
	[K in OptionalKeys<T>]?: ValueType<T['parameters'][K]['type']>;
} & {
	[K in RequiredKeys<T>]: ValueType<T['parameters'][K]['type']>;
};

/**
 * Shape of a single CLI parameter definition.
 */
export interface ClassCommandParameterSchema {
	defaultValue?: ValueType<Type>;
	description?: string;
	required?: true;
	type: Type;
}

/**
 * Schema describing a CLI command and its parameters.
 */
export interface ClassCommandSchema {
	description?: string;
	parameters: Record<string, ClassCommandParameterSchema>;
}

type OptionalKeys<T extends ClassCommandSchema> = {
	[K in keyof T['parameters']]: ParameterIsRequired<T['parameters'][K]> extends true ? never : K;
}[keyof T['parameters']];

type ParameterIsRequired<T extends ClassCommandParameterSchema> = T extends { required: true }
	? true
	: T extends { default: string }
		? true
		: false;

type RequiredKeys<T extends ClassCommandSchema> = {
	[K in keyof T['parameters']]: ParameterIsRequired<T['parameters'][K]> extends true ? K : never;
}[keyof T['parameters']];
