/*
Copyright 2020, Alexis Royer, https://github.com/Alexis-ROYER/tsd-default-export

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/


export const JS_EXPORT_DEFAULT_STATEMENTS = [
    "module.exports =",
    "module.exports.default =",
    "export default",
    ["exports = module.exports =", "exports.default = module.exports;"].join("\n"),
];
export const DTS_EXPORT_DEFAULT_STATEMENTS = [
    "export default",
    "export =",
];
export const TS_IMPORT_DEFAULT_STATEMENTS = [
    "import MyClass from './my-module';",
    "import * as MyClass from './my-module';",
    "import MyClass = require('./my-module');",
    "const MyClass = require('./my-module');",
];
export const TSC_TARGET_OPTIONS = [
    null,
    "--target es6",         // i.e. ES2015
    "--target es2016",      // i.e. ES7
    "--target es2017",      // i.e. ES8
    "--target es2018",      // i.e. ES9
];
export const TSC_MODULE_INTEROP_OPTIONS = [
    null,
    "--esModuleInterop",    // i.e. ES5 + __importStar and __importDefault helpers
];
export const TSC_MODULE_OPTIONS = [
    null,                   // Should be ES5 by default.
    "--module commonjs",    // i.e. ES5
    "--module es6",         // i.e. ES2015
];
export const NODE_EXEC_OPTIONS = [
    null,                   // ES5 supported by default.
    "-r esm"                // ES6 support
];
