/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import shell from "../src/shell";
import { fake } from "../src/Fake";

describe('milestone delete', () => {
    describe.each`
    localStorage              | expectedLocalStorage
    ${'milestone-delete.yml'} | ${'milestone-delete-expected.yml'}
    `('when the local storage is $localStorage', ({ localStorage, expectedLocalStorage }) => {
        it('should delete a milestone from the local storage.', async () => {                        
            const localStorageSandbox = await fake(localStorage).toSandbox();

            try {
                await shell(
                    `node dist/bundle.js milestone delete 
                    --number=2 
                    --local-storage="${localStorageSandbox.path}"`);                

                expect(await localStorageSandbox.read()).toBe(
                    await fake(expectedLocalStorage).read());
            }
            finally {
                await localStorageSandbox.delete();
            }
        });
    });
});
