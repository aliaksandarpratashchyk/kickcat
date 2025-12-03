/**
 * KickCat v0.4.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('Given user force pushing all issue', () => {
    describe.each`
    localStorage                                    | remoteStorage                                    | expectedLocalStorage                                     | expectedRemoteStorage  
    ${'all-issue-force-pushing-absent-local.yml'}   | ${'all-issue-force-pushing-absent-remote.yml'}   | ${'all-issue-force-pushing-absent-local-expected.yml'}   | ${'all-issue-force-pushing-absent-remote-expected.yml'}    
    ${'all-issue-force-pushing-obsolete-local.yml'} | ${'all-issue-force-pushing-obsolete-remote.yml'} | ${'all-issue-force-pushing-obsolete-local-expected.yml'} | ${'all-issue-force-pushing-obsolete-remote-expected.yml'}    
    ${'all-issue-force-pushing-outdated-local.yml'} | ${'all-issue-force-pushing-outdated-remote.yml'} | ${'all-issue-force-pushing-outdated-local-expected.yml'} | ${'all-issue-force-pushing-outdated-remote-expected.yml'}    
    ${'all-issue-force-pushing-conflict-local.yml'} | ${'all-issue-force-pushing-conflict-remote.yml'} | ${'all-issue-force-pushing-conflict-local-expected.yml'} | ${'all-issue-force-pushing-conflict-remote-expected.yml'}    
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
                    --of=issue
                    --force`);                

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
