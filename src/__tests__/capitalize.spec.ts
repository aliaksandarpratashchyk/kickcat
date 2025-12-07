/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import capitalize from '../capitalize';

describe(capitalize.name, () => {
	describe.each`
		text     | expected
		${'foo'} | ${'Foo'}
	`('when the text is $text', ({ expected, text }) => {
		it(`should return ${expected}.`, () => {
			expect(capitalize(text)).toBe(expected);
		});
	});
});
