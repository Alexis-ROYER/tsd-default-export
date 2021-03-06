/*
Copyright 2020, Alexis Royer, https://github.com/Alexis-ROYER/tsd-default-export

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as fs from "fs-extra";
import * as path from "path";
import { PROJECT_DIR, MAIN_OUTDIR } from "./consts";

// Let's start to remove the couple of files in the `dist` directory.
for (const distPath of fs.readdirSync(path.join(PROJECT_DIR, "dist"))) {
    if (fs.lstatSync(path.join(PROJECT_DIR, "dist", distPath)).isFile()
        && (distPath.endsWith(".js") || distPath.endsWith(".ts"))
    ) {
        fs.removeSync(path.join(PROJECT_DIR, "dist", distPath))
    }
}
// Eventually remove the output dir, with possibly huge content.
fs.removeSync(MAIN_OUTDIR);
