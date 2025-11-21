/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import booleanType from '../BooleanType';
import LiteralType from '../LiteralType';
import stringType from '../StringType';
import UnionType from '../UnionType';

describe(UnionType.name, () => {
	describe(UnionType.prototype.parse.name, () => {
		describe.each`
			value      | expected   | types
			${'true'}  | ${true}    | ${[booleanType, stringType]}
			${'hello'} | ${'hello'} | ${[booleanType, stringType]}
		`('when types is $types and value is $value', ({ expected, types, value }) => {
			it(`should return ${expected}.`, () => {
				const unionType = new UnionType(types);

				expect(unionType.parse(value)).toBe(expected);
			});
		});

		it('should throw when value does not match any type.', () => {
			const unionType = new UnionType([new LiteralType('yes'), new LiteralType('no')]);

			expect(() => unionType.parse('maybe')).toThrow('maybe is invalid for type yes|no.');
		});
	});
	describe(UnionType.prototype.toString.name, () => {
		describe.each`
			types                                           | expected
			${[booleanType, stringType]}                    | ${'boolean|string'}
			${[new LiteralType('y'), new LiteralType('n')]} | ${'y|n'}
		`('when types is $types', ({ expected, types }) => {
			it(`should return ${expected}.`, () => {
				const unionType = new UnionType(types);

				expect(unionType.toString()).toBe(expected);
			});
		});
	});
});
