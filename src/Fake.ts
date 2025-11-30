/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import Sandbox from "./Sandbox";

export default class Fake {
    readonly name: string;
    readonly path: string;    
    #eof = false;
    #file = '';

    constructor(name: string) {
        this.name = name;
        this.path = resolve(process.cwd(), 'e2e', '__fakes__', name);
    }

    async read(): Promise<string> {
        if (!this.#eof) {
            this.#file = await readFile(this.path, { encoding: 'utf-8' });
            this.#eof = true;
        }
        
        return this.#file;
    }

    async toSandbox(): Promise<Sandbox> {
        const sandbox = new Sandbox(this);
        await sandbox.copy();

        return sandbox;
    }

    toString(): string {
        return this.path;
    }
}

export function fake(name: string): Fake {
    return new Fake(name);
}
