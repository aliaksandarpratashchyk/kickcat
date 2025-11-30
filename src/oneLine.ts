/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

const NEWLINE_REGEXP = /(?:\r|\n|\r\n)+/gu;

export default function oneLine(text: string): string {
    return text.replaceAll(NEWLINE_REGEXP, ' ');    
}