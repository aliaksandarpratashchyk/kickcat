/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import kebab from "../kebab";
import stringType from "./StringType";
import type { Type } from "./Type";
import type RequestContext from './RequestContext';
import { isUndefined } from "underscore";
import booleanType from "./BooleanType";
import nonNullable from "../nonNullable";

export interface CommanOptionConfiguration {
    tag: string;
    name?: string;        
    type?: Type;
    description?: string;
    required?: boolean;
    defaultValue?: unknown;
}

export function isValidCommandOptionName(option: string): boolean {
    return !/\s+/u.test(option.trim());
}

export function normalizeCommandOptionName(option: string): string {
    return `--${kebab(option.trim())}`;
}

export function compileCommandOptionPattern(option: string): RegExp {
    return new RegExp(`^${option}`, 'iu');
}

const OPTION_REGEX = /^--(?<key>[A-Za-z0-9_-]+)(?:=(?<value>(?:"[^"]*"|'[^']*'|[^"']+)))?$/u;

function unwrapQuotes(value: string): string {
    if (value.length < 2)
        return value;

    const quotes = [`"`, `'`];
    const first = nonNullable(value[0]);
    const last = value[value.length - 1];

    if (quotes.includes(first) && first === last)
        return value.slice(1, -1);

    return value;
}

export default class CommandOption {
    readonly tag: string;
    readonly name: string;
    readonly #pattern: RegExp;
    readonly type: Type;
    readonly description: string;
    readonly required: boolean;
    readonly defaultValue: unknown;

    constructor({
        tag,
        name,
        type,
        description,
        required,
        defaultValue
    }: CommanOptionConfiguration) {
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

    test(option: string): boolean {
        return this.#pattern.test(option);
    }

	// eslint-disable-next-line max-statements, max-lines-per-function
	parse(request: RequestContext): void {
        console.log(`Parsing ${this.name} option...`);        

        console.log(`The raw request is "${request.raw.join(' ')}".`);

        const rawIndex = request.raw.findIndex(option => this.test(option));
        // eslint-disable-next-line no-undefined
        const raw = rawIndex >= 0 ? request.raw[rawIndex] : undefined;

        if (isUndefined(raw)) {
            console.log(`The option is not found, checking required and default value.`);

            if (this.required && isUndefined(this.defaultValue))
                throw new Error(`Parameter "${this.name}" is required.`);

            if (!isUndefined(this.defaultValue))
                request.options[this.tag] = this.defaultValue;

            console.log(`The option is not required and don't have default value, skipping.`);

            return;
        }

        const match = OPTION_REGEX.exec(raw);

        if (!match)
            throw new Error(`Incorrect option format ${this.name}.`);

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
            if (!isUndefined(this.defaultValue))
                request.options[this.tag] = this.defaultValue;
            else if (this.required)
                throw new Error(`Parameter "${this.name}" is required.`);

            return;
        }

        request.options[this.tag] = this.type.parse(unwrappedValue);        
    }
}
