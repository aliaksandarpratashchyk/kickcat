/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import booleanType from '../BooleanType';

describe('booleanType', () => {
	describe(booleanType.parse.name, () => {
		describe.each`
			value      | expected
			${'true'}  | ${true}
			${'1'}     | ${true}
			${'yes'}   | ${true}
			${'on'}    | ${true}
			${'false'} | ${false}
			${'0'}     | ${false}
			${'no'}    | ${false}
			${'off'}   | ${false}
		`('when the value is $value', ({ expected, value }) => {
			it(`should return ${expected}.`, () => {
				expect(booleanType.parse(value)).toBe(expected);
			});
		});

		it('should throw on invalid value.', () => {
			expect(() => booleanType.parse('maybe')).toThrow('Invalid value for boolean option type.');
		});
	});
	describe(booleanType.toString.name, () => {
		it('should return "boolean".', () => {
			expect(booleanType.toString()).toBe('boolean');
		});
	});
});
