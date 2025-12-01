/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import { container, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';
import { logLevelType, OFF } from '../logging/LogLevel';
import LoggerFacade from '../logging/LoggerFacade';
import ConsoleLogger from '../logging/ConsoleLogger';

@singleton()
export default class LoggingConfigurationMiddleware implements ClassCommand<typeof LoggingConfigurationMiddleware.schema> {
	static readonly schema = {
		parameters: {
			logLevel: {
				description: 'Log level.',
				type: logLevelType,
				defaultValue: OFF,
			},
		},
	} satisfies ClassCommandSchema;		

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	execute({
		logLevel
	}: ClassCommandOptions<typeof LoggingConfigurationMiddleware.schema>): void {

		const logger = new LoggerFacade(new ConsoleLogger(), logLevel);
		container.registerInstance(LoggerFacade, logger);		
	}
}
