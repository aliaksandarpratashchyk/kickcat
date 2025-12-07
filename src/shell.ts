/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import oneLine from './oneLine';

/**
 * Executes a shell command and echoes stdout/stderr to the console.
 */
export default async function shell(command: string): Promise<void> {
	const { stderr, stdout } = await promisify(exec)(oneLine(command));
	if (stdout.trim())
		// eslint-disable-next-line no-console
		console.log(stdout);
	if (stderr.trim())
		// eslint-disable-next-line no-console
		console.error(stderr);
}
