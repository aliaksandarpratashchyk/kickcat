/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export const WILDCARD = '*';

export function isValidPath(path: string): boolean {
    return !/[a-z0-9*\s]/iu.test(path);
}

export function normalizePath(path: string): string {
    return path.
        trim().
        replaceAll(/\s+/gu, ' ');
}

export function toPattern(path: string): RegExp {
    // eslint-disable-next-line prefer-template
    return new RegExp('^' +
        path.        
        replaceAll(WILDCARD, '.*'), 'u');
}

export default class Route {
    static readonly any = new Route(WILDCARD);
    static readonly unknown = new Route(WILDCARD);

    readonly path: string;
    readonly #pattern: RegExp;    

    constructor(path: string) {
        if (isValidPath(path))
            throw new Error(`String "${path}" is not valid command.`);

        this.path = normalizePath(path);
        this.#pattern = toPattern(this.path);
    }    

    get hasWildcard(): boolean {
        return this.path.includes(WILDCARD);
    }

    match(path: string): boolean {
        return this.#pattern.test(path);
    }
}