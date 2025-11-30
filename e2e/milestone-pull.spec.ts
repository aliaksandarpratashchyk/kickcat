/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('milestone pull', () => {
    describe.each`
    localStorage                           | remoteStorage                  | expectedLocalStorage
    ${'milestone-pull-local-absent.yml'}   | ${'milestone-pull-remote.yml'} | ${'milestone-pull-local-absent-expected.yml'}
    ${'milestone-pull-local-conflict.yml'} | ${'milestone-pull-remote.yml'} | ${'milestone-pull-local-conflict-expected.yml'}
    ${'milestone-pull-local-outdated.yml'} | ${'milestone-pull-remote.yml'} | ${'milestone-pull-local-outdated-expected.yml'}
    `('when the local storage is $localStorage and the remote storage is $remoteStorage', 
        ({ localStorage, remoteStorage, expectedLocalStorage }) => {
        it('should pull a milestone from the remote to the local storage.', async () => {                        
            const localStorageSandbox = await fake(localStorage).toSandbox();
            const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

            try {
                await shell(
                    `node dist/bundle.js milestone pull 
                    --number=2 
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"`);                

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
