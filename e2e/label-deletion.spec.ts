/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import shell from '../src/shell';
import { fake } from '../src/Fake';

describe('Given user deleting a label', () => {
	describe.each`
		localStorage                  | expectedLocalStorage
		${'label-deletion-local.yml'} | ${'label-deletion-local-expected.yml'}
	`('when the local storage is $localStorage', ({ localStorage, expectedLocalStorage }) => {
		it('should delete a label from the local storage.', async () => {
			const localStorageSandbox = await fake(localStorage).toSandbox();

			try {
				await shell(
					`node dist/bundle.js entity delete 
                    --local-storage="${localStorageSandbox.path}"
                    --of=label
                    --key=name
                    --value=priority:high`,
				);

				expect(await localStorageSandbox.read()).toBe(await fake(expectedLocalStorage).read());
			} finally {
				await localStorageSandbox.delete();
			}
		});
	});
});
