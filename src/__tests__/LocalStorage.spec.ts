/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveEntitySchema } from '../EntitySchema';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import { ISSUE } from '../EntityType';
import LoggerFacade from '../logging/LoggerFacade';
import { OFF } from '../logging/LogLevel';
import LocalStorage from '../localStorage/LocalStorage';

describe(LocalStorage.name, () => {
	it('resolves entity files inside directory storage paths', async () => {
		const root = await mkdtemp(join(tmpdir(), 'kickcat-local-storage-'));

		try {
			const storageDir = join(root, '.github');
			const issuesPath = join(storageDir, 'issues.yml');

			await mkdir(storageDir, { recursive: true });
			await writeFile(issuesPath, '', 'utf8');

			const schemaRegistry = new EntitySchemaRegistry();
			schemaRegistry.add(ISSUE, await resolveEntitySchema(ISSUE));

			const storage = new LocalStorage(
				{ storagePath: storageDir },
				schemaRegistry,
				new LoggerFacade(undefined, OFF),
			);

			await storage.new(ISSUE, { title: 'Test issue' });
			await storage.commit();

			const contents = await readFile(issuesPath, 'utf8');
			expect(contents).toContain('title: Test issue');
		} finally {
			await rm(root, { recursive: true, force: true });
		}
	});
});

