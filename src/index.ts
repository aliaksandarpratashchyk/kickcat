/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import _package from '../package.json';
import Application from './cli/Application';
import { command } from './cli/Command';
import addMilestone from './commands/addMilestone';
import deleteMilestone from './commands/deleteMilestone';
import help from './commands/help';
import pullMilestone from './commands/pullMilestone';

const application = new Application({
	author: _package.author,
	commands: [
		command(addMilestone),
		command(deleteMilestone),
		command(help),
		command(pullMilestone),
	],
	description: _package.description,
	license: _package.license,
	name: _package.name,
	version: _package.version,
});

try {
	await application.executeCommand();
} catch (error) {
	if (typeof error === 'object' && error !== null && 'message' in error)
		console.error(error.message);
	else console.error(error);
}
