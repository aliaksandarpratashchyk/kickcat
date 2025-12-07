/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

/**
 * Wildcard token for route paths.
 */
export const WILDCARD = '*';

/**
 * Represents a command route that can be matched against paths.
 */
export default class Route {
	static readonly any = new Route(WILDCARD);
	static readonly unknown = new Route(WILDCARD);

	readonly path: string;
	get hasWildcard(): boolean {
		return this.path.includes(WILDCARD);
	}

	readonly #pattern: RegExp;

	constructor(path: string) {
		if (isValidPath(path)) throw new Error(`String "${path}" is not valid command.`);

		this.path = normalizePath(path);
		this.#pattern = toPattern(this.path);
	}

	/**
	 * Checks if a path matches the route pattern.
	 */
	match(path: string): boolean {
		return this.#pattern.test(path);
	}
}

/**
 * Checks whether a route path contains only allowed characters.
 */
export function isValidPath(path: string): boolean {
	return !/[a-z0-9*\s]/iu.test(path);
}

/**
 * Trims and normalizes whitespace in a route path.
 */
export function normalizePath(path: string): string {
	return path.trim().replaceAll(/\s+/gu, ' ');
}

/**
 * Converts a route path into a regex pattern, honoring wildcards.
 */
export function toPattern(path: string): RegExp {
	// eslint-disable-next-line prefer-template
	return new RegExp('^' + path.replaceAll(WILDCARD, '.*'), 'u');
}
