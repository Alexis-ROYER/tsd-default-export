# Goal #

The goal of this project is to test how default exports work, when:
1. defined in a `.js` input module,
2. declared through a `.d.ts` file,
3. and eventually used in a final `.ts` script.

It particularly aims to clarify which scenarii actually work, depending on:
- the statement used for the default export in the `.js` input module,
- the statement used for its corresponding declaration in the `.d.ts` file,
- the statement used for the default import in the client `.ts` script,
- the `tsc` options that tell the ECMA version considered for reading input `.ts` files,
- the `tsc` options that tell the ECMA version considered for generating the output `.js` files,
- the `node` options that tell the ECMA version considered for executing the input & output `.js` files.

# Recommendations #

As of (March 2020):
- `typescript@3.6.3`
- `node@10.16.3` to `node@12.16.1`
- `esm@3.2.25`

Here is a set of recommendations I conclude with:
1. Use ES6 default imports & exports:
    - in the .d.ts files: `export default MyClass`
    - in the .ts scripts: `import MyClass from './my-module'`
2. Use the `tsc --esModuleInterop` option.
3. Use the `tsc --module commonjs` option.

Doing so:
- You ensure the compatibility with legacy (`module.exports =`) or ES6 (`export default`) default exports from the .js input script
- You ensure the production of a .js output script that does not require the use of the `esm` advanced module loader package.

Note: You may use the `tsc --target` option you want (as long as the `tsc --module commonjs` ensures the expected compatibility for the .js output scripts).

See [DETAILS.md](DETAILS.md) for the descriptions of the tests and their analysis that led to these recommendations.

---
Published under ISC license (see [LICENSE.md](./LICENSE.md)).
