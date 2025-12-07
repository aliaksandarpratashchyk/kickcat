/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import kebab from '../kebab';

describe(kebab.name, () => {
	describe.each`
		text           | expected
		${'fooBarBaz'} | ${'foo-bar-baz'}
	`('when the text is $text', ({ expected, text }) => {
		it(`should return ${expected}.`, () => {
			expect(kebab(text)).toBe(expected);
		});
	});
});
