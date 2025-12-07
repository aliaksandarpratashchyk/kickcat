/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { container, singleton } from 'tsyringe';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import ConsoleLogger from '../logging/ConsoleLogger';
import LoggerFacade from '../logging/LoggerFacade';
import { logLevelType, OFF } from '../logging/LogLevel';

/**
 * Middleware that configures logging based on the provided log level.
 */
@singleton()
export default class LoggingConfigurationMiddleware
	implements ClassCommand<typeof LoggingConfigurationMiddleware.schema>
{
	static readonly schema = {
		parameters: {
			logLevel: {
				defaultValue: OFF,
				description: 'Log level.',
				type: logLevelType,
			},
		},
	} satisfies ClassCommandSchema;

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	execute({ logLevel }: ClassCommandOptions<typeof LoggingConfigurationMiddleware.schema>): void {
		const logger = new LoggerFacade(new ConsoleLogger(), logLevel);
		container.registerInstance(LoggerFacade, logger);
	}
}
