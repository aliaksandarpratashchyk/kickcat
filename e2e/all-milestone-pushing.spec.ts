/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('Given user pushing all milestone', () => {
    describe.each`
    localStorage                                  | remoteStorage                                  | expectedLocalStorage                                   | expectedRemoteStorage  
    ${'all-milestone-pushing-absent-local.yml'}   | ${'all-milestone-pushing-absent-remote.yml'}   | ${'all-milestone-pushing-absent-local-expected.yml'}   | ${'all-milestone-pushing-absent-remote-expected.yml'}    
    ${'all-milestone-pushing-obsolete-local.yml'} | ${'all-milestone-pushing-obsolete-remote.yml'} | ${'all-milestone-pushing-obsolete-local-expected.yml'} | ${'all-milestone-pushing-obsolete-remote-expected.yml'}    
    ${'all-milestone-pushing-outdated-local.yml'} | ${'all-milestone-pushing-outdated-remote.yml'} | ${'all-milestone-pushing-outdated-local-expected.yml'} | ${'all-milestone-pushing-outdated-remote-expected.yml'}    
    ${'all-milestone-pushing-conflict-local.yml'} | ${'all-milestone-pushing-conflict-remote.yml'} | ${'all-milestone-pushing-conflict-local-expected.yml'} | ${'all-milestone-pushing-conflict-remote-expected.yml'}    
    `('when the local storage is $localStorage and the remote storage is $remoteStorage', 
        ({ localStorage, remoteStorage, expectedLocalStorage, expectedRemoteStorage }) => {
        it('should push all from the local to the remote storage.', async () => {                        
            const localStorageSandbox = await fake(localStorage).toSandbox();
            const remoteStorageSandbox = await fake(remoteStorage).toSandbox();

            try {
                await shell(
                    `node dist/bundle.js entity push all                     
                    --local-storage="${localStorageSandbox.path}"
                    --remote-storage="${remoteStorageSandbox.path}"
                    --of=milestone`);

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
