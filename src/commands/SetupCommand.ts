/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { inject, singleton } from 'tsyringe';

import type { ClassCommand } from '../cli/ClassCommand';
import type { ClassCommandOptions, ClassCommandSchema } from '../cli/ClassCommandSchema';

import booleanType from '../cli/BooleanType';
import { exists } from '../exists';
import LoggerFacade from '../logging/LoggerFacade';

/**
 * CLI command that installs the bundled GitHub Actions workflows into a repository.
 */
@singleton()
export default class SetupCommand implements ClassCommand<typeof SetupCommand.schema> {
	static readonly schema = {
		description: 'Setup GitHub workflows.',
		parameters: {
			rewrite: {
				description: 'Rewrite existing files.',
				type: booleanType,
			},
		},
	} satisfies ClassCommandSchema;

	readonly #logger: LoggerFacade;

	constructor(@inject(LoggerFacade) logger: LoggerFacade) {
		this.#logger = logger;
	}

	async execute({ rewrite }: ClassCommandOptions<typeof SetupCommand.schema>): Promise<void> {
		const rewriteExisting = rewrite === true;
		const templatesFolder = await this.#findTemplatesWorkflowsFolder();
		const githubFolder = await this.#ensureGithubFolder();
		const workflowsFolder = join(githubFolder, 'workflows');

		this.#logger.info(
			`Copying workflow templates${rewriteExisting ? ' with rewrite enabled' : ''}.`,
		);

		await this.#copyFolder(templatesFolder, workflowsFolder, rewriteExisting);
	}

	// eslint-disable-next-line max-statements
	async #copyFolder(source: string, destination: string, rewrite: boolean): Promise<void> {
		await mkdir(destination, { recursive: true });

		const entries = await readdir(source, { withFileTypes: true });

		for (const entry of entries) {
			const sourcePath = join(source, entry.name);
			const destinationPath = join(destination, entry.name);

			if (entry.isDirectory()) {
				// eslint-disable-next-line no-await-in-loop
				await this.#copyFolder(sourcePath, destinationPath, rewrite);
			} else if (entry.isFile()) {
				// eslint-disable-next-line no-await-in-loop
				const destinationExists = await exists(destinationPath);

				if (destinationExists && !rewrite) {
					this.#logger.info(`Skipping existing file "${destinationPath}".`);
					// eslint-disable-next-line no-continue
					continue;
				}

				// eslint-disable-next-line no-await-in-loop
				await copyFile(sourcePath, destinationPath);
			}
		}
	}

	async #ensureGithubFolder(): Promise<string> {
		let folder = process.cwd();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			const githubFolder = join(folder, '.github');

			// eslint-disable-next-line no-await-in-loop
			if (await this.#isDirectory(githubFolder)) return githubFolder;

			const parentFolder = dirname(folder);

			if (parentFolder === folder) break;

			folder = parentFolder;
		}

		const githubFolder = join(process.cwd(), '.github');
		await mkdir(githubFolder, { recursive: true });

		return githubFolder;
	}

	async #findTemplatesWorkflowsFolder(): Promise<string> {
		let folder = __dirname;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			const candidate = resolve(folder, 'templates', 'workflows');

			// eslint-disable-next-line no-await-in-loop
			if (await this.#isDirectory(candidate)) return candidate;

			const parentFolder = dirname(folder);

			if (parentFolder === folder) break;

			folder = parentFolder;
		}

		throw new Error(`Templates folder "templates/workflows" is not found.`);
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
	async #isDirectory(path: string): Promise<boolean> {
		if (!(await exists(path))) return false;

		const stats = await stat(path);

		return stats.isDirectory();
	}
}
