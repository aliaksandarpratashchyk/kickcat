/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import hash from '../hash';

describe(hash.name, () => {
	describe.each`
		value                      | expected
		${{ bar: 2, foo: 1 }}      | ${'14c0e5f8cddbd6fdcda779fa08f84b49'}
		${{ foo: ['bar', 'baz'] }} | ${'aa03c758114a9ae239f877a785588981'}
	`('when the value is $value', ({ expected, value }) => {
		it(`should return ${expected}.`, () => {
			expect(hash(value)).toBe(expected);
		});
	});
});
