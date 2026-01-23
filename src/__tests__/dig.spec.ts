/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { fs, vol } from 'memfs';
import { join } from 'path';

import dig from '../dig';

jest.mock('fs/promises', () => fs.promises);

vol.fromJSON({
	'/foo/bar': 'baz',
	'/foo/baz/bar': 'baz',
});

describe(dig.name, () => {
	describe.each`
		path      | expected
		${'/foo'} | ${[ join('/foo', 'bar'), join('/foo', 'baz', 'bar') ]}
		${'/bar'} | ${[]}
	`('when the path is $path', ({ expected, path }) => {
		it(`should return ${expected}.`, async () => {
			expect(await dig(path)).toEqual(expected);
		});
	});
});
