/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import 'reflect-metadata';

import _package from '../package.json';
import Application from './cli/Application';
import HelpMiddleware from './cli/HelpMiddleware';
import MilestoneDeleteCommand from './commands/MilestoneDeleteCommand';
import MilestonePushAllCommand from './commands/MilestonePushAllCommand';
import MilestonePullCommand from './commands/MilestonePullCommand';
import 'dotenv/config';
import type { Milestone } from './Milestone';
import { container } from 'tsyringe';
import RemoteMilestoneCollection from './remoteStorage/RemoteMilestoneCollection';
import HelpCommand from './cli/HelpCommand';
import { resolveEntitySchema } from './EntitySchema';
import { MILESTONE } from './EntityType';
import GitHubTokenMiddleware from './commands/GitHubTokenMiddleware';
import LocalStorageConfigurationMiddleware from './commands/LocalStorageConfigurationMiddleware';
import RequestContext from './cli/RequestContext';
import EntitySchemaRegistry from './EntitySchemaRegistry';
import RemoteStorageConfigurationMiddleware from './commands/RemoteStorageConfigurationMiddleware';
import RepairCommand from './commands/RepairCommand';

try {		

	const milestoneSchema = await resolveEntitySchema<Milestone>(
		MILESTONE, 
		{
			applicationName: _package.name,
		});

	const entitySchemaRegistry = new EntitySchemaRegistry();
	entitySchemaRegistry.add(MILESTONE, milestoneSchema);

	container.registerInstance(EntitySchemaRegistry, entitySchemaRegistry);

	container.registerSingleton(
		'RemoteMilestoneCollection',
		RemoteMilestoneCollection);

	const application = new Application({
		author: _package.author,		
		description: _package.description,
		license: _package.license,
		name: _package.name,
		version: _package.version,
	});

	application.
		on.
		any.
		use(HelpMiddleware);	

	application.
		on.
		unknown.		
		use(HelpCommand);

	application.
		on('help').
		use(HelpCommand);	

	application.
		on('milestone delete').		
		use(LocalStorageConfigurationMiddleware).
		use(MilestoneDeleteCommand);

	application.
		on('milestone pull').			
		use(LocalStorageConfigurationMiddleware).
		use(RemoteStorageConfigurationMiddleware).
		use(MilestonePullCommand);

	application.
		on('milestone push all').		
		use(GitHubTokenMiddleware).
		use(LocalStorageConfigurationMiddleware).
		use(RemoteStorageConfigurationMiddleware).
		use(MilestonePushAllCommand);		

	application.
		on('repair').
		use(LocalStorageConfigurationMiddleware).
		use(RepairCommand);

	container.registerInstance(Application, application);

	const request = RequestContext.new();
	container.registerInstance(RequestContext, request);

	await application.execute(request);

} catch (error) {
	if (typeof error === 'object' && error !== null && 'message' in error)
		console.error(error.message);
	else console.error(error);
}
