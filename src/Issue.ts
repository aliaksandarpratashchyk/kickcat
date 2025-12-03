/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import type { Entity } from "./Entity";

export interface Issue extends Entity {
    title: string;
    milestone?: number | string;
    labels?: string[];  
    dependencies?: (number | string)[];    
    description: string;
}
