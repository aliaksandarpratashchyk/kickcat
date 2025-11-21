/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import LiteralType from '../LiteralType';

describe(LiteralType.name, () => {
	describe(LiteralType.prototype.parse.name, () => {
		describe.each`
			literal    | input      | expected
			${'foo'}   | ${'foo'}   | ${'foo'}
			${'bar'}   | ${'bar'}   | ${'bar'}
			${'hello'} | ${'hello'} | ${'hello'}
		`('when literal is $literal and value is $input', ({ expected, input, literal }) => {
			it(`should return ${expected}.`, () => {
				const literalType = new LiteralType(literal);

				expect(literalType.parse(input)).toBe(expected);
			});
		});

		it('should throw when the value does not match the literal.', () => {
			const literalType = new LiteralType('foo');

			expect(() => literalType.parse('bar')).toThrow('');
		});
	});
	describe(LiteralType.prototype.toString.name, () => {
		describe.each`
			value      | expected
			${'foo'}   | ${'foo'}
			${'bar'}   | ${'bar'}
			${'hello'} | ${'hello'}
		`('when the literal value is $value', ({ expected, value }) => {
			it(`should return ${expected}.`, () => {
				const literalType = new LiteralType(value);

				expect(literalType.toString()).toBe(expected);
			});
		});
	});
});
