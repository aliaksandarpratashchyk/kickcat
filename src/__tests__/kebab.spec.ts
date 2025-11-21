/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
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
