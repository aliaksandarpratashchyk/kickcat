/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import Application from '../Application';
import Command from '../Command';
import CommandOption from '../CommandOption';
import booleanType from '../BooleanType';
import RequestContext from '../RequestContext';
import Route from '../Route';
import stringType from '../StringType';

describe(Application.name, () => {	
	describe(Application.prototype.execute.name, () => {
		it(`should execute a command registered on a matching route.`, async () => {
			const action = jest.fn();
			const command = new Command(action);
			command.options.add(new CommandOption({
				tag: 'bar',
				description: 'bar option',
				type: stringType,
			}));
			const app = new Application({
				name: 'kickhub',
			});
			app.on('foo').use(command);
			const request = new RequestContext(['foo', '--bar=baz']);

			await app.execute(request);

			expect(action).toHaveBeenCalledWith({ '--bar': 'baz' });
			expect(request.route?.path).toBe('foo');
		});

		it('should mark the request as unknown when no route matches.', async () => {
			const app = new Application({
				name: 'kickhub',
			});
			const request = new RequestContext(['unknown']);

			await app.execute(request);

			expect(request.route).toBe(Route.unknown);
		});

		describe('when a required parameter is missing', () => {
			it('should throw an error.', async () => {
				const command = new Command(jest.fn());
				command.options.add(new CommandOption({
					tag: 'requiredFlag',
					description: 'required flag',
					required: true,
					type: booleanType,
				}));
				const app = new Application({
					name: 'kickhub',
				});
				app.on('foo').use(command);
				const request = new RequestContext(['foo']);

				await expect(app.execute(request)).rejects.toThrow('Parameter "--required-flag" is required.');
			});
		});

		it('should execute unknown route commands when no specific route matches.', async () => {
			const middleware = new Command(jest.fn());
			const unknown = new Command(jest.fn());
			const app = new Application({
				name: 'kickhub',
			});
			app.on.any.use(middleware);
			app.on.unknown.use(unknown);
			const request = new RequestContext(['missing']);

			await app.execute(request);

			expect(middleware.action).toHaveBeenCalledTimes(1);
			expect(unknown.action).toHaveBeenCalledTimes(1);
			expect(request.route).toBe(Route.unknown);
		});

		it('should not execute unknown route commands when a concrete route matches.', async () => {
			const middleware = new Command(jest.fn());
			const unknown = new Command(jest.fn());
			const help = new Command(jest.fn());
			const app = new Application({
				name: 'kickhub',
			});
			app.on.any.use(middleware);
			app.on.unknown.use(unknown);
			app.on('help').use(help);
			const request = new RequestContext(['help', '--command=foo']);

			await app.execute(request);

			expect(middleware.action).toHaveBeenCalledTimes(1);
			expect(help.action).toHaveBeenCalledTimes(1);
			expect(unknown.action).not.toHaveBeenCalled();
			expect(request.route?.path).toBe('help');
		});
	});
});
