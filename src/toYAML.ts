/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { type Node, Scalar, YAMLMap, YAMLSeq } from 'yaml';

import nonNullable from './nonNullable';

/**
 * Converts a JS value into a YAML AST node while preserving ordering for objects.
 */
export default function toYAML(value: unknown): Node {
	if (typeof value === 'string') {
		const scalar = new Scalar(value);

		if (value.includes('\n')) scalar.type = Scalar.BLOCK_LITERAL;

		return scalar;
	}

	if (Array.isArray(value)) {
		const yaml = new YAMLSeq();
		value.forEach((item) => {
			yaml.add(toYAML(item));
		});

		return yaml;
	}

	if (typeof value === 'object' && value !== null) {
		const yaml = new YAMLMap();
		Object.keys(value)
			.toSorted()
			.forEach((key) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				yaml.add({ key, value: toYAML(nonNullable((value as Record<string, unknown>)[key])) });
			});

		return yaml;
	}

	return new Scalar(value);
}
