/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import 'reflect-metadata';

import _package from '../package.json';
import Application from './cli/Application';
import HelpMiddleware from './cli/HelpMiddleware';
import 'dotenv/config';
import type { Milestone } from './Milestone';
import { container } from 'tsyringe';
import RemoteMilestoneCollection from './remoteStorage/RemoteMilestoneCollection';
import HelpCommand from './cli/HelpCommand';
import { resolveEntitySchema } from './EntitySchema';
import { ISSUE, LABEL, MILESTONE } from './EntityType';
import LocalStorageConfigurationMiddleware from './commands/LocalStorageConfigurationMiddleware';
import RequestContext from './cli/RequestContext';
import EntitySchemaRegistry from './EntitySchemaRegistry';
import RemoteStorageConfigurationMiddleware from './commands/RemoteStorageConfigurationMiddleware';
import RepairCommand from './commands/RepairCommand';
import LoggingConfigurationMiddleware from './commands/LoggingConfigurationMiddleware';
import EntityDeleteCommand from './commands/EntityDeleteCommand';
import EntityPullCommand from './commands/EntityPullCommand';
import EntityPushAllCommand from './commands/EntityPushAllCommand';
import type { Label } from './Label';
import type { Issue } from './Issue';

try {		

	const entitySchemaRegistry = new EntitySchemaRegistry();

	const milestoneSchema = await resolveEntitySchema<Milestone>(
		MILESTONE, 
		{
			applicationName: _package.name,
		});
	
	entitySchemaRegistry.add(MILESTONE, milestoneSchema);

	const labelSchema = await resolveEntitySchema<Label>(
		LABEL,
		{
			applicationName: _package.name,
		});
	
	entitySchemaRegistry.add(LABEL, labelSchema);

	const issueSchema = await resolveEntitySchema<Issue>(
		ISSUE,
		{
			applicationName: _package.name,
		});
	
	entitySchemaRegistry.add(ISSUE, issueSchema);

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
		use(LoggingConfigurationMiddleware).
		use(HelpMiddleware);	

	application.
		on.
		unknown.		
		use(HelpCommand);

	application.
		on('help').
		use(HelpCommand);	

	application.
		on('entity delete').
		use(LocalStorageConfigurationMiddleware).
		use(EntityDeleteCommand);

	application.
		on('entity pull').
		use(LocalStorageConfigurationMiddleware).
		use(RemoteStorageConfigurationMiddleware).
		use(EntityPullCommand);		

	application.
		on('entity push all').				
		use(LocalStorageConfigurationMiddleware).
		use(RemoteStorageConfigurationMiddleware).
		use(EntityPushAllCommand);					

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
		// eslint-disable-next-line no-console
		console.error(error.message);
	// eslint-disable-next-line no-console
	else console.error(error);
}
