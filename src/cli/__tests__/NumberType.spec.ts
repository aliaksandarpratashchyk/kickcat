/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import numberType from '../NumberType';

describe('numberType', () => {
	describe(numberType.parse.name, () => {
		describe.each`
			value     | expected
			${'0'}    | ${0}
			${'42'}   | ${42}
			${'3.14'} | ${3.14}
		`('when the value is $value', ({ expected, value }) => {
			it(`should return ${expected}.`, () => {
				expect(numberType.parse(value)).toBe(expected);
			});
		});

		it('should return NaN for invalid numeric input.', () => {
			expect(() => numberType.parse('abc')).toThrow();
		});
	});
	describe(numberType.toString.name, () => {
		it('should return "number".', () => {
			expect(numberType.toString()).toBe('number');
		});
	});
});
