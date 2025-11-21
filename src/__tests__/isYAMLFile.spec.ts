/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import isYAMLFile from '../isYAMLFile';

describe(isYAMLFile.name, () => {
	describe.each`
		path          | expected
		${'foo.yml'}  | ${true}
		${'foo.yaml'} | ${true}
		${'foo.json'} | ${false}
	`('when the path is $path', ({ expected, path }) => {
		it(`should return ${expected}.`, () => {
			expect(isYAMLFile(path)).toBe(expected);
		});
	});
});
