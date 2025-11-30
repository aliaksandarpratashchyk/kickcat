/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { resolve } from "node:path";
import { copyFile, readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type Fake from "./Fake";

export default class Sandbox {
    readonly fake: Fake;
    path: string;
    #ready = false;

    constructor(fake: Fake) {
        this.fake = fake;
        this.path = resolve(process.cwd(), 'e2e', '__sandbox__', `${this.fake.name}+${randomUUID()}.yml`);
    }

    async copy(): Promise<void> {
        if (this.#ready)
            return;

        await copyFile(
            this.fake.path,
            this.path);

        this.#ready = true;
    }

    async delete(): Promise<void> {
        if (!this.#ready)
            return;

        await unlink(this.path);
        this.#ready = false;
    }

    async read(): Promise<string> {
        return readFile(this.path, { encoding: 'utf-8' });
    }

    toString(): string {
        return this.path;
    }
}
