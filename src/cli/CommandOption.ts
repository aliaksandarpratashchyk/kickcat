/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { isUndefined } from 'underscore';

import type LoggerFacade from '../logging/LoggerFacade';
import type RequestContext from './RequestContext';
import type { Type } from './Type';

import kebab from '../kebab';
import nonNullable from '../nonNullable';
import booleanType from './BooleanType';
import stringType from './StringType';

/**
 * Configuration for a CLI option definition.
 */
export interface CommanOptionConfiguration {
	defaultValue?: unknown;
	description?: string;
	name?: string;
	required?: boolean;
	tag: string;
	type?: Type;
}

/**
 * Builds a regex to match a long-form option by name.
 */
export function compileCommandOptionPattern(option: string): RegExp {
	return new RegExp(`^${option}`, 'iu');
}

/**
 * Validates that an option name does not contain whitespace.
 */
export function isValidCommandOptionName(option: string): boolean {
	return !/\s+/u.test(option.trim());
}

/**
 * Normalizes an option name into the long `--kebab` format.
 */
export function normalizeCommandOptionName(option: string): string {
	return `--${kebab(option.trim())}`;
}

const OPTION_REGEX = /^--(?<key>[A-Za-z0-9_-]+)(?:=(?<value>(?:"[^"]*"|'[^']*'|[^"']+)))?$/u;

/**
 * Represents a single CLI option including parsing logic.
 */
export default class CommandOption {
	readonly defaultValue: unknown;
	readonly description: string;
	readonly name: string;
	readonly required: boolean;
	readonly tag: string;
	readonly type: Type;
	readonly #pattern: RegExp;

	constructor({ defaultValue, description, name, required, tag, type }: CommanOptionConfiguration) {
		this.tag = tag;

		if (!isValidCommandOptionName(name ?? tag))
			throw new Error(`"${name}" is not valid command option name.`);

		this.name = normalizeCommandOptionName(name ?? tag);
		this.#pattern = compileCommandOptionPattern(this.name);

		this.type = type ?? stringType;
		this.description = description ?? 'The option description is missing.';
		this.required = required ?? false;
		this.defaultValue = defaultValue;
	}

	/**
	 * Parses an option from the request, applying defaults and validation.
	 */
	// eslint-disable-next-line max-lines-per-function, complexity, max-statements
	parse(request: RequestContext, logger?: LoggerFacade): void {
		logger?.debug(`Parsing ${this.name} option...`);
		logger?.debug(`The raw request is "${request.raw.join(' ')}".`);

		const rawIndex = request.raw.findIndex((option) => this.test(option));
		// eslint-disable-next-line no-undefined
		const raw = rawIndex >= 0 ? request.raw[rawIndex] : undefined;

		if (isUndefined(raw)) {
			logger?.debug(`The option is not found, checking required and default value.`);

			if (this.required && isUndefined(this.defaultValue))
				throw new Error(`Parameter "${this.name}" is required.`);

			if (!isUndefined(this.defaultValue)) request.options[this.tag] = this.defaultValue;

			logger?.debug(`The option is not required and don't have default value, skipping.`);

			return;
		}

		const match = OPTION_REGEX.exec(raw);

		if (!match) throw new Error(`Incorrect option format ${this.name}.`);

		let value = match[2];

		if (isUndefined(value) && this.type !== booleanType) {
			const nextValueCandidate = request.raw[rawIndex + 1];

			if (!isUndefined(nextValueCandidate) && !nextValueCandidate.startsWith('--'))
				value = nextValueCandidate;
		}

		// eslint-disable-next-line no-undefined
		const unwrappedValue = isUndefined(value) ? undefined : unwrapQuotes(value);

		if (this.type === booleanType && (unwrappedValue ?? '') === '') {
			request.options[this.tag] = true;
			return;
		}

		if (isUndefined(unwrappedValue) || unwrappedValue === '') {
			if (!isUndefined(this.defaultValue)) request.options[this.tag] = this.defaultValue;
			else if (this.required) throw new Error(`Parameter "${this.name}" is required.`);

			return;
		}

		request.options[this.tag] = this.type.parse(unwrappedValue);
	}

	/**
	 * Checks whether a raw argument matches this option.
	 */
	test(option: string): boolean {
		return this.#pattern.test(option);
	}
}

function unwrapQuotes(value: string): string {
	if (value.length < 2) return value;

	const quotes = [`"`, `'`];
	const first = nonNullable(value[0]);
	const last = value[value.length - 1];

	if (quotes.includes(first) && first === last) return value.slice(1, -1);

	return value;
}
