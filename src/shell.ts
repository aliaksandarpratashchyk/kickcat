/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import oneLine from "./oneLine";

export default async function shell(command: string): Promise<void> {
    const { stdout, stderr } = await promisify(exec)(oneLine(command));     
    console.log(stdout);  
    if (stderr)
        console.error(stderr);         
}