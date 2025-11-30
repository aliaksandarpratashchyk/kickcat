/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { fs, vol } from 'memfs';

import dig from '../dig';

jest.mock('fs/promises', () => fs.promises);

vol.fromJSON({
	'/foo/bar': 'baz',
	'/foo/baz/bar': 'baz',
});

describe(dig.name, () => {
	describe.each`
		path      | expected
		${'/foo'} | ${['\\foo\\bar', '\\foo\\baz\\bar']}
		${'/bar'} | ${[]}
	`('when the path is $path', ({ expected, path }) => {
		it(`should return ${expected}.`, async () => {
			expect(await dig(path)).toEqual(expected);
		});
	});
});
