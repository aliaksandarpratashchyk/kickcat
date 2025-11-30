/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export default function unsafe<T>(value: unknown): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return value as T;
}