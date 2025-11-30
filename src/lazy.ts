/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

export type Provider<T> = () => Promise<T>;

export default function lazy<T>(provider: Provider<T>): Provider<T> {
    let fetched = false;
    let value: T | null = null;
    return async () => {
        if (!fetched) {
            value = await provider();            
            // eslint-disable-next-line require-atomic-updates
            fetched = true;
        }
            
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return value as unknown as T;
    };
}