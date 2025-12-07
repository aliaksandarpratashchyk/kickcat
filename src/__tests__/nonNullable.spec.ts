/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import nonNullable from '../nonNullable';

describe(nonNullable.name, () => {
	describe.each`
		value    | expected
		${'foo'} | ${'foo'}
	`('when the value is "$value"', ({ expected, value }) => {
		it(`should return ${expected}.`, () => {
			expect(nonNullable(value)).toBe(expected);
		});
	});
});
