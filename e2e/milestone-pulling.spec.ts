/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import shell from '../src/shell';
import { fake } from '../src/Fake';

describe('Given user pulling a milestone', () => {
	describe.each`
		localStorage                              | remoteStorage                              | expectedLocalStorage
		${'milestone-pulling-absent-local.yml'}   | ${'milestone-pulling-absent-remote.yml'}   | ${'milestone-pulling-absent-local-expected.yml'}
		${'milestone-pulling-conflict-local.yml'} | ${'milestone-pulling-conflict-remote.yml'} | ${'milestone-pulling-conflict-local-expected.yml'}
		${'milestone-pulling-outdated-local.yml'} | ${'milestone-pulling-outdated-remote.yml'} | ${'milestone-pulling-outdated-local-expected.yml'}
	`(
		'when the local storage is $localStorage and the remote storage is $remoteStorage',
		({ localStorage, remoteStorage, expectedLocalStorage }) => {
			it('should pull a milestone from the remote to the local storage.', async () => {
				const localStorageSandbox = await fake(localStorage).toSandbox();
				const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

				try {
					await shell(
						`node dist/bundle.js entity pull 
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"
                    --of=milestone
                    --key=number
                    --value=2`,
					);

					expect(await localStorageSandbox.read()).toBe(await fake(expectedLocalStorage).read());
				} finally {
					await localStorageSandbox.delete();
					await remoteStorageSandbox.delete();
				}
			});
		},
	);
});
