/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import type CommandOption from './CommandOption';

/**
 * Collection wrapper for command options keyed by name.
 */
export default class CommandOptionCollection implements Iterable<CommandOption> {
	readonly #options = new Map<string, CommandOption>();

	/**
	 * Adds or replaces an option in the collection.
	 */
	add(option: CommandOption): void {
		this.#options.set(option.name, option);
	}

	/**
	 * Returns an option by its normalized name.
	 */
	get(option: string): CommandOption | undefined {
		return this.#options.get(option);
	}

	/**
	 * Iterates over stored command options.
	 */
	[Symbol.iterator](): Iterator<CommandOption> {
		return this.#options.values();
	}
}
