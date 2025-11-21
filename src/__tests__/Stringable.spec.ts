/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import isStringable from '../Stringable';

describe(isStringable, () => {
	describe.each`
		value        | expected
		${'foo'}     | ${true}
		${{}}        | ${true}
		${undefined} | ${false}
		${null}      | ${false}
	`('when the value is $value', ({ expected, value }) => {
		it(`should return ${expected}.`, () => {
			expect(isStringable(value)).toBe(expected);
		});
	});
});
