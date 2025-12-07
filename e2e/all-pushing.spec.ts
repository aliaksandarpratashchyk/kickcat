/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import shell from '../src/shell';
import { fake } from '../src/Fake';

describe('Given user pushing all', () => {
	describe.each`
		localStorage                        | remoteStorage                        | expectedLocalStorage                         | expectedRemoteStorage
		${'all-pushing-absent-local.yml'}   | ${'all-pushing-absent-remote.yml'}   | ${'all-pushing-absent-local-expected.yml'}   | ${'all-pushing-absent-remote-expected.yml'}
		${'all-pushing-obsolete-local.yml'} | ${'all-pushing-obsolete-remote.yml'} | ${'all-pushing-obsolete-local-expected.yml'} | ${'all-pushing-obsolete-remote-expected.yml'}
		${'all-pushing-outdated-local.yml'} | ${'all-pushing-outdated-remote.yml'} | ${'all-pushing-outdated-local-expected.yml'} | ${'all-pushing-outdated-remote-expected.yml'}
		${'all-pushing-conflict-local.yml'} | ${'all-pushing-conflict-remote.yml'} | ${'all-pushing-conflict-local-expected.yml'} | ${'all-pushing-conflict-remote-expected.yml'}
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
                    --remote-storage="${remoteStorageSandbox.path}"`,
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
