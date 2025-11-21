/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Command } from '../Command';
import type { CommandSchema } from '../CommandSchema';

import Application from '../Application';
import booleanType from '../BooleanType';
import stringType from '../StringType';

describe(Application.name, () => {
	const originalArgv = process.argv;

	afterEach(() => {
		process.argv = originalArgv;
		jest.clearAllMocks();
	});

	describe(Application.prototype.executeCommand.name, () => {
		it(`should execute a command.`, async () => {
			const command: Command = Object.assign(jest.fn(), {
				schema: {
					name: 'foo',
					parameters: {
						bar: {
							description: 'bar option',
							type: stringType,
						},
					},
				},
			});
			const app = new Application({
				commands: [command],
				name: 'kickhub',
			});
			process.argv = ['node', 'kickhub', 'foo', '--bar=baz'];

			await app.executeCommand();

			expect(command).toHaveBeenCalledWith({ bar: 'baz' }, app);
		});

		describe('when the command is unknown', () => {
			it('should throw an error.', async () => {
				const app = new Application({
					commands: [],
					name: 'kickhub',
				});
				process.argv = ['node', 'kickhub', 'unknown'];

				await expect(app.executeCommand()).rejects.toThrow('Command "unknown" is unknown.');
			});
		});

		describe('when the parameter is unknown', () => {
			it('should throw an error.', async () => {
				const command: Command = Object.assign(jest.fn(), {
					schema: {
						name: 'foo',
						parameters: {
							known: {
								description: 'known option',
								type: stringType,
							},
						},
					},
				});
				const app = new Application({
					commands: [command],
					name: 'kickhub',
				});
				process.argv = ['node', 'kickhub', 'foo', '--unknown=value'];

				await expect(app.executeCommand()).rejects.toThrow('Parameter "unknown" is unknown.');
			});
		});

		describe('when a required parameter is missing', () => {
			it('should throw an error.', async () => {
				const command: Command = Object.assign(jest.fn(), {
					schema: {
						name: 'foo',
						parameters: {
							requiredFlag: {
								description: 'required flag',
								required: true,
								type: booleanType,
							},
						},
					} satisfies CommandSchema,
				});
				const app = new Application({
					commands: [command],
					name: 'kickhub',
				});
				process.argv = ['node', 'kickhub', 'foo'];

				await expect(app.executeCommand()).rejects.toThrow('Parameter "requiredFlag" is required.');
			});
		});
	});
});
