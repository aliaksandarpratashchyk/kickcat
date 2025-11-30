/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import stringType from '../cli/StringType';
import { container, singleton } from 'tsyringe';
import type { ClassCommand } from '../cli/ClassCommand';

@singleton()
export default class GitHubTokenMiddleware implements ClassCommand<typeof GitHubTokenMiddleware.schema> {
	static readonly schema = {
		parameters: {
			gitHubToken: {
				description: 'GitHub authentication token.',
				type: stringType
			},
		},
	} satisfies ClassCommandSchema;	
	
	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	execute({
		gitHubToken
	}: ClassCommandOptions<typeof GitHubTokenMiddleware.schema>): void {
		container.register<string | undefined>('GitHubToken', {
			useValue: gitHubToken ?? process.env['GITHUB_TOKEN'],
		});
	}
}
