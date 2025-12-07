/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import camel from '../camel';

describe(camel.name, () => {
	describe.each`
		text             | expected
		${'foo-bar-baz'} | ${'fooBarBaz'}
	`('when the text is $text', ({ expected, text }) => {
		it(`should return ${expected}.`, () => {
			expect(camel(text)).toBe(expected);
		});
	});
});
