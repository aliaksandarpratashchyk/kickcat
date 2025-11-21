/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
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
