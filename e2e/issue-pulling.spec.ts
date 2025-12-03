/**
 * KickCat v0.4.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('Given user pulling an issue', () => {
    describe.each`
    localStorage                          | remoteStorage                          | expectedLocalStorage
    ${'issue-pulling-absent-local.yml'}   | ${'issue-pulling-absent-remote.yml'}   | ${'issue-pulling-absent-local-expected.yml'}
    ${'issue-pulling-conflict-local.yml'} | ${'issue-pulling-conflict-remote.yml'} | ${'issue-pulling-conflict-local-expected.yml'}
    ${'issue-pulling-outdated-local.yml'} | ${'issue-pulling-outdated-remote.yml'} | ${'issue-pulling-outdated-local-expected.yml'}
    `('when the local storage is $localStorage and the remote storage is $remoteStorage', 
        ({ localStorage, remoteStorage, expectedLocalStorage }) => {
        it('should pull an issue from the remote to the local storage.', async () => {                        
            const localStorageSandbox = await fake(localStorage).toSandbox();
            const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

            try {
                await shell(                    
                    `node dist/bundle.js entity pull 
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"
                    --of=issue
                    --key=number
                    --value=2`);

                expect(await localStorageSandbox.read()).toBe(
                    await fake(expectedLocalStorage).read());
            }
            finally {
                await localStorageSandbox.delete();
                await remoteStorageSandbox.delete();
            }
        });
    });
});
