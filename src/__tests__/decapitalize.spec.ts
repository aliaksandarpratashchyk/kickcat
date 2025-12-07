/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import decapitalize from '../decapitalize';

describe(decapitalize.name, () => {
	describe.each`
		text     | expected
		${'Foo'} | ${'foo'}
	`('when the text is $text', ({ expected, text }) => {
		it(`should return ${expected}.`, () => {
			expect(decapitalize(text)).toBe(expected);
		});
	});
});
