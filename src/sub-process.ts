/*
Copyright 2020, Alexis Royer, https://github.com/Alexis-ROYER/tsd-default-export

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import { spawnSync, SpawnSyncReturns } from "child_process";
import { PROJECT_DIR } from "./consts";

export class SubProcess {
    private readonly program: string;
    private readonly options: string[] = [];
    private res?: SpawnSyncReturns<string>;

    public constructor(program: string, ...options: string[]) {
        this.program = program;
        this.options.push(...options);
    }

    public addOptions(...options: string[]): SubProcess {
        this.options.push(...options);
        return this;
    }

    public run(): number {
        this.res = spawnSync(this.program, this.options);
        return this.res.status;
    }

    public stdout(): string {
        let stdout = "";
        if (this.res) {
            stdout = this.res.stdout.toString();
            while (stdout.includes(PROJECT_DIR)) {
                stdout = stdout.replace(PROJECT_DIR, "<PROJECT_DIR>", )
            }
        }
        return stdout;
    }

    public stderr(): string {
        let stderr = "";
        if (this.res) {
            stderr = this.res.stderr.toString();
            while (stderr.includes(PROJECT_DIR)) {
                stderr = stderr.replace(PROJECT_DIR, "<PROJECT_DIR>");
            }
        }
        return stderr;
    }
}
