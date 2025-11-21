/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { fs, vol } from 'memfs';

import { exists } from '../exists';

jest.mock('fs/promises', () => fs.promises);

vol.fromJSON({
	'/foo/bar': 'baz',
});

describe(exists.name, () => {
	describe.each`
		path          | expected
		${'/foo'}     | ${true}
		${'/foo/bar'} | ${true}
		${'/bar'}     | ${false}
	`('when the path is $path', ({ expected, path }) => {
		it(`should return ${expected}.`, async () => {
			expect(await exists(path)).toBe(expected);
		});
	});
});
