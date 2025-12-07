/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import shell from '../src/shell';
import { fake } from '../src/Fake';

describe('Given user pulling a label', () => {
	describe.each`
		localStorage                          | remoteStorage                          | expectedLocalStorage
		${'label-pulling-absent-local.yml'}   | ${'label-pulling-absent-remote.yml'}   | ${'label-pulling-absent-local-expected.yml'}
		${'label-pulling-conflict-local.yml'} | ${'label-pulling-conflict-remote.yml'} | ${'label-pulling-conflict-local-expected.yml'}
		${'label-pulling-outdated-local.yml'} | ${'label-pulling-outdated-remote.yml'} | ${'label-pulling-outdated-local-expected.yml'}
	`(
		'when the local storage is $localStorage and the remote storage is $remoteStorage',
		({ localStorage, remoteStorage, expectedLocalStorage }) => {
			it('should pull a label from the remote to the local storage.', async () => {
				const localStorageSandbox = await fake(localStorage).toSandbox();
				const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

				try {
					await shell(
						`node dist/bundle.js entity pull 
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"
                    --of=label
                    --key=name
                    --value=priority:high`,
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
