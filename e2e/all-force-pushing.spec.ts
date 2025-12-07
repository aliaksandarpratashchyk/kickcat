/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import shell from '../src/shell';
import { fake } from '../src/Fake';

describe('Given user force pushing all', () => {
	describe.each`
		localStorage                              | remoteStorage                              | expectedLocalStorage                               | expectedRemoteStorage
		${'all-force-pushing-absent-local.yml'}   | ${'all-force-pushing-absent-remote.yml'}   | ${'all-force-pushing-absent-local-expected.yml'}   | ${'all-force-pushing-absent-remote-expected.yml'}
		${'all-force-pushing-obsolete-local.yml'} | ${'all-force-pushing-obsolete-remote.yml'} | ${'all-force-pushing-obsolete-local-expected.yml'} | ${'all-force-pushing-obsolete-remote-expected.yml'}
		${'all-force-pushing-outdated-local.yml'} | ${'all-force-pushing-outdated-remote.yml'} | ${'all-force-pushing-outdated-local-expected.yml'} | ${'all-force-pushing-outdated-remote-expected.yml'}
		${'all-force-pushing-conflict-local.yml'} | ${'all-force-pushing-conflict-remote.yml'} | ${'all-force-pushing-conflict-local-expected.yml'} | ${'all-force-pushing-conflict-remote-expected.yml'}
	`(
		'when the local storage is $localStorage and the remote storage is $remoteStorage',
		({ localStorage, remoteStorage, expectedLocalStorage, expectedRemoteStorage }) => {
			it('should push all from the local to the remote storage.', async () => {
				const localStorageSandbox = await fake(localStorage).toSandbox();
				const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

				try {
					await shell(
						`node dist/bundle.js entity push all                     
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"
					--force
					`,
					);

					expect(await localStorageSandbox.read()).toBe(await fake(expectedLocalStorage).read());
					expect(await remoteStorageSandbox.read()).toBe(await fake(expectedRemoteStorage).read());
				} finally {
					await localStorageSandbox.delete();
					await remoteStorageSandbox.delete();
				}
			});
		},
	);
});
