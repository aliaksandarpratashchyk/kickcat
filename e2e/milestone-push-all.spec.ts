/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('milestone push all', () => {
    describe.each`
    localStorage                               | remoteStorage                               | expectedLocalStorage                                | expectedRemoteStorage  
    ${'milestone-push-all-absent-local.yml'}   | ${'milestone-push-all-absent-remote.yml'}   | ${'milestone-push-all-absent-local-expected.yml'}   | ${'milestone-push-all-absent-remote-expected.yml'}    
    ${'milestone-push-all-obsolete-local.yml'} | ${'milestone-push-all-obsolete-remote.yml'} | ${'milestone-push-all-obsolete-local-expected.yml'} | ${'milestone-push-all-obsolete-remote-expected.yml'}    
    ${'milestone-push-all-outdated-local.yml'} | ${'milestone-push-all-outdated-remote.yml'} | ${'milestone-push-all-outdated-local-expected.yml'} | ${'milestone-push-all-outdated-remote-expected.yml'}    
    ${'milestone-push-all-conflict-local.yml'} | ${'milestone-push-all-conflict-remote.yml'} | ${'milestone-push-all-conflict-local-expected.yml'} | ${'milestone-push-all-conflict-remote-expected.yml'}    
    `('when the local storage is $localStorage and the remote storage is $remoteStorage', 
        ({ localStorage, remoteStorage, expectedLocalStorage, expectedRemoteStorage }) => {
        it('should push all from the local to the remote storage.', async () => {                        
            const localStorageSandbox = await fake(localStorage).toSandbox();
            const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

            try {
                await shell(
                    `node dist/bundle.js milestone push all                     
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"`);                

                expect(await localStorageSandbox.read()).toBe(
                    await fake(expectedLocalStorage).read());

                expect(await remoteStorageSandbox.read()).toBe(
                    await fake(expectedRemoteStorage).read());
            }
            finally {
                await localStorageSandbox.delete();
                await remoteStorageSandbox.delete();
            }
        });
    });
});
