# Tests cases #

This project tests all combinations with the following options:
1. Default export statement in the `.js` input module:
    - `module.exports =`  
      Legacy commonjs statement.
    - `module.exports.default =`  
      Default export via an explicit `default` symbol.
    - `exports = module.exports =` followed by `exports.default = module.exports`  
      Combination of the two previous options.
    - `export default`  
      Regular ES6 default export statement.
2. Default export statement in the `.d.ts` declaration file:
    - `export =`  
      Legacy commonjs statement.
    - `export default`  
      Regular ES6 default export statement.
3. Default import statement in the `.ts` script:
    - `import MyClass from './my-module'`  
      Regular ES6 default import statement.
    - `import * as MyClass from './my-module'`  
      ES6 namespace import statement.
    - `const MyClass = require('./my-module')`
      Legacy commonjs statement.
    - `import MyClass = require('./my-module')`
      Other version of the previous option.
4. Typescript `--target` option:
    - none
    - `--target es6` (i.e. ES2015)
    - `--target es2016` (i.e. ES7)
    - `--target es2017` (i.e. ES8)
    - `--target es2018` (i.e. ES9)
5. Typescript module interoperability option:
    - none
    - `--esModuleInterop`  
      (i.e. ES5, with the addition of `__importStar()` and `__importDefault()` helpers in the output `.js` file)
6. Typescript `--module` option:
    - none
    - `--module commonjs` (i.e. ES5)
    - `--module es6` (i.e. ES2015)
7. `node` execution options:
    - none
    - `-r esm`  
      Use of the `esm` advanced module loader package.

The cross-product of all these options give 1920 test cases.

# Build & launch #

```bash
npm run test
```

Notes: This command takes a couple of hours to build the results.

The [all-test-cases.xlsx](./all-test-cases.xlsx) Excel file gathers the results obtained with the following versions of:
- `typescript@3.6.3`
- `node@10.16.3`
- `esm@3.2.25`

# Points of clarification

Before diving in the detailed analysis, it is useful to bring clarification on a couple of points.

## `tsc` options dependencies ##

The [`tsc` options documentation](http://www.typescriptlang.org/docs/handbook/compiler-options.html) was not really clear to me, thus this experimentation clarified the purpose of some of them:
- About `--target` and `--module` options:
    - The `--target` option specifies which ECMA version that `tsc` should consider for parsing the input `.ts` scripts.
    - The `--module` option specifies which version ECMA `tsc` should use to generate the output `.js` script.
- When the `--module` is not set, the use of the `--target` option with `es6` or more implies a silent default `es6` value for the `--module` option (see [TypeStrong - issue#570](https://github.com/TypeStrong/ts-loader/issues/570)).
- The `--esModuleInterop` option generates `__importDefault()` and/or `__importStart()` interoperability functions in the commonjs output.
- The `--esModuleInterop` option has no effect when the `--module` option is set to `es6` either explicitly or implicitly due to the `--target` option.

## No node.js support for ES6 default exports & imports by default ##

To date (March 2020, node v12.16.1), `node` does not support ES6 default exports and imports by default.

Former versions of `node` provided no native support for this.
`node` had to be launched with the `-r esm` ES6 module support
(see [timonweb.com - 2019](https://timonweb.com/tutorials/how-to-enable-ecmascript-6-imports-in-nodejs/)).

The latest versions of `node` now provide native support for ESM (ECMAScript Modules, see: [esm_enabling](https://nodejs.org/api/esm.html#esm_enabling)), but it still has to be expicitly activated.

According to [stackoverflow#45854169](https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node):
- from `node@13`, we will just have to name the files with the `.mjs` extension to activate this ESM support, which seems a nice approach,
- however, as of March 2020, the LTS version of `node` is still the `node@12` series, which requires the use of the `--experimental-modules` option.

By the way, when the `tsc --module` option is set to `es6` (either explicitly or implicitly), and an ES6 default import or namespace import is used in the `.ts` script, then `node` must be launched with the appropriate options to enable ES6 module support.

# Detailed analysis #

## October 2019: `typescript@3.6.3` / `node@10.16.3` / `esm@3.2.25`

The detailed analysis for each test case is given in the this [all-test-cases.xlsx](./all-test-cases.xlsx) Excel file.

The results have been classified as follow:
- **COMJS-JSOUT-NEEDS-DEFAULT**  
  Commonjs `.js` output generated from `.ts` with ES6 default import needs a reserved `default` export symbol from the `.js` imported module.
- **TSCMI-COMJS-INTEROP**  
  `tsc --esModuleInterop` ensures module interoperability with commonjs or ES6 `.js` imported modules thanks to the `__importDefault()` function generated in the commonjs `.js` output.
    - The `module.exports =` commonjs default export pattern still must be used in the `.js` imported module when it is a commonjs one, otherwise the import fails (*).
    - When the `.js` module contains an ES6 default export, it cannot be executed without the `-r esm` ES6 module support.
- **ES6-JSOUT-INTEROP**  
  ES6 `.js` output executed with the `-r esm` module support ensures module interoperability with `.js` commonjs or ES6 modules.
    - Same as (*): `module.exports =` must be used in the `.js` input module, otherwise the import fails.
- **NS-COMJS-REQ-HACK**  
  ES6 `import *` namespace import transpiled as a legacy `require()` in commonjs `.js` output makes legacy `module.exports =` default export of the `.js` imported module work.
    - Same as (*): `module.exports =` must be used in the `.js` input module, otherwise this hack fails.
- **NS-TSCMI-COMJS-NOT-DEFAULT**  
  An ES6 `import *` namespace import transpiled as `__importStar()` in commonjs output thanks to the `tsc --esModuleInterop` cannot be used to catch neither a legacy `module.exports =` commonjs nor an ES6 default export.
- **NS-ES6-NOT-DEFAULT**  
  An ES6 `import *` namespace import transpiled *as is* in ES6 output with `tsc --module es6` cannot be used to catch neither a legacy `module.exports =` commonjs export nor an ES6 default export.
- **COMJS-REQUIRE**  
  Legacy commonjs `require()` imports in the `.ts` script generate legacy `require()` imports in `.js` output (either commonjs or ES6) which require legacy `module.exports =` default exports from the `.js` module.
    - Provides no type checkings during the TypeScript transpilation.
    - The `import xxx = require()` pattern makes Visual Studio Code handle the typings, while tsc surprisingly does not check typings for the given module, and behaves the same as with a `const xxx = require()` pattern.
- **IMPREQ-TRANSP-ERROR**  
  `import xxx = require()` pattern not compatible with `tsc --module es6`: causes a "Consider using..." transpilation error.
    - The `const xxx = require()` pattern does not suffer such transpilation errors.
- **ES6-JSIN-NEEDS-ESM**  
  ES6 exports in the `.js` module cannot be executed without the `-r esm` ES6 module support.
- **ES6-JSOUT-NEEDS-ESM**  
  ES6 imports (default import or namespace import) in the `.js` output cannot be executed without the `-r esm` ES6 module support.
    - May hide an error of the ES6-JSIN-NEEDS-ESM kind.

## March 2020: Upgrade to `node@12.16.1`

With the migration to `node@12.16.1`,
the significant differences only concern the **ES6-JSIN-NEEDS-ESM** and **ES6-JSOUT-NEEDS-ESM** classes.

Errors messages have changes from:
> SyntaxError: Unexpected identifier

to:
> SyntaxError: Cannot use import statement outside a module

As explained above, the latest versions of `node` now provide native support for ESM (ECMAScript Modules, see: [esm_enabling](https://nodejs.org/api/esm.html#esm_enabling)),
which explains the modification of the error message.

# Conclusion #

Generating ES6 output, works fine in general.
Backward compatibility is provided with various export & import statements from the ES6 modules.
However, as of version v12.16.1 (March 2020), `node` requires the use of the `--experimental-modules` option.

As long as `node` does not support ES6 default imports & exports by default, it seems preferable to use the `tsc --esModuleInterop`.
This option generates commonjs code that embeds the `__importStar()` and `__importDefault()` helpers, which produce the same behaviour, but compatible with a regular version of `node`, and without the use of specific options.

In order to ensure that the `tsc --esModuleInterop` is not avoided by the `tsc --module` option, this last option shall be set with `--module commonjs`.

Based on this configuration:
- A few legacy statements in the `.ts` scripts still do not work, and therefore shall not be used.
- The non-standard `module.exports.default =` statement in the `.js` input module does not work, and shall not be used.
- All other configurations work fine.

Whatever, the use of the ES6 syntax in `.ts` scripts and `.d.ts` files shall be preferred for ongoing compatibility.

# Memo: Useful resources #

Useful resources on module export / import:
- [stackoverflow#39109027](https://stackoverflow.com/questions/39109027/write-a-declaration-file-for-a-default-export-module) - *Write a declaration file for a default export module*  
  Question answered on August 2016.  
  Tells that `module.export =` in the `.js` module should lead to `export =` in the `.d.ts` file, then `import xxx = require()` shall be used in the user `.ts` script.  
  Our experimentation eventually contradicts this statement.
- [TypeScript - issue#2242](https://github.com/Microsoft/TypeScript/issues/2242) - *ES6 Modules*  
  Issue closed on April 2015, but that continued to receive comments up to September 2016 (referenced by the previous resource).  
  Long argumentation in the TypeScript project issue tracker on github, dealing with a trade-off on default exports, ending apparently (as far as I have understood) in the decision of leaving the things in the state the previous question [stackoverflow#39109027](https://stackoverflow.com/questions/39109027/write-a-declaration-file-for-a-default-export-module) figures.  
  We learn from this issue that "An external module may designate a *default export*, which is an export with the reserved name `default`."
- [timonweb.com - 2017](https://timonweb.com/posts/how-to-enable-es6-imports-in-nodejs/) - *How To Enable ES6 Imports in Node.JS*  
  First post from Tim Kamanin dating from November 2017, outdated by the 2019 tutorial below.
- [timonweb.com - 2019](https://timonweb.com/tutorials/how-to-enable-ecmascript-6-imports-in-nodejs/) - *How To Enable ECMAScript 6 Imports in Node.JS*  
  Tutorial dating from May 2019, by Tim Kamanin.  
  Tim explains that "Today, in 2019, Node.js still doesn't support ES6 imports.", and shows how to enable the feature with the `esm` hammer package.
- Mozilla [Using the default export](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#Using_the_default_export) and [Importing defaults](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import#Importing_defaults) documentations.  
  Useful links to the ES6 ECMA specifications.
- [ES6 specification](https://www.ecma-international.org/ecma-262/6.0/), with the particular [Exports](https://www.ecma-international.org/ecma-262/6.0/#sec-exports) and [Imports](https://www.ecma-international.org/ecma-262/6.0/#sec-imports) chapters.
- [`module.exports` api documentation](https://nodejs.org/api/modules.html#modules_module_exports) on nodejs.org.
- [https://node.green/](https://node.green/)  
  Interesting view on what feature is actually supported in node.js.  
  Unfortunately, could not find in this page the info confirming that ES6 default exports and imports would not be managed natively (as mentionned by [timonweb.com - 2019](https://timonweb.com/tutorials/how-to-enable-ecmascript-6-imports-in-nodejs/).

Regarding `tsc` options:
- [TypeScript Compiler Options](http://www.typescriptlang.org/docs/handbook/compiler-options.html)  
  Official documentation for the `tsc` compiler options.  
  `--esModuleInterop`, `--target` and `--module` options contribute to the way default exports behave.
- [TypeStrong - issue#570](https://github.com/TypeStrong/ts-loader/issues/570) - *tsc has "module" default to "es2015", but ts-loader does not*  
  This issue analyzes the way `tsc` `--target` and `--module` options behave and concludes that:
> if "target" is set to any of ["es6", "es2015", "es2016", "es2017", "esNext"], then "module" defaults to "es6"

Regarding the latest ESM (ECMAScript Module) support of `node`:
- [ECMAScript Modules (ESM) support enabling](https://nodejs.org/api/esm.html#esm_enabling) on nodejs.org.
- [stackoverflow#58384179](https://stackoverflow.com/questions/58384179/syntaxerror-cannot-use-import-statement-outside-a-module) - *SyntaxError: Cannot use import statement outside a module*  
  Question answered late 2019. Several answers on the way to activate the native support of `esm` by the latest versions of `node`.
- [stackoverflow#45854169](https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node) - *How can I use an es6 import in node?*  
  Clarifies explicitly which versions of `node` provide native support for ESM and how.
