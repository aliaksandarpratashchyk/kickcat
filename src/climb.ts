/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { dirname } from 'path';

export default function climb(path: string): string[] {
    const folders: string[] = [ path ];
    let folder = dirname(path);

    while (!folders.includes(folder)) {
        folders.push(folder);
        folder = dirname(path);
    }

    return folders;
}
