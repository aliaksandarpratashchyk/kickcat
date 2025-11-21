/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import stringType from '../StringType';

describe('stringType', () => {
	describe(stringType.parse.name, () => {
		describe.each`
			value      | expected
			${''}      | ${''}
			${'hello'} | ${'hello'}
			${'123'}   | ${'123'}
		`('when the value is $value', ({ expected, value }) => {
			it(`should return ${expected}.`, () => {
				expect(stringType.parse(value)).toBe(expected);
			});
		});
	});
	describe(stringType.toString.name, () => {
		it('should return "stringType".', () => {
			expect(stringType.toString()).toBe('string');
		});
	});
});
