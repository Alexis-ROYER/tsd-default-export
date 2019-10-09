/*
Copyright 2020, Alexis Royer, https://github.com/Alexis-ROYER/tsd-default-export

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as fs from "fs-extra";
import * as path from "path";
import { SubProcess } from "./sub-process";
import * as csvWriter from "csv-writer";
import * as options from "./options";
import { TSC_BIN_SCRIPT, PROJECT_DIR, MAIN_OUTDIR } from "./consts";


type TestCase = {
    "id": number;
    "js": string;
    "dts": string;
    "ts": string;
    "tsc-target": string | null;
    "tsc-module-interop": string | null;
    "tsc-module": string | null;
    "node-opts": string | null;
    "result"?: "PASS" | "FAIL";
    "error"?: string;
};

function runAllTestCases(): TestCase[] {
    const rows: TestCase[] = [];
    const T0 = Date.now();
    const testCount = (
        options.JS_EXPORT_DEFAULT_STATEMENTS.length
        * options.DTS_EXPORT_DEFAULT_STATEMENTS.length
        * options.TS_IMPORT_DEFAULT_STATEMENTS.length
        * options.TSC_TARGET_OPTIONS.length
        * options.TSC_MODULE_INTEROP_OPTIONS.length
        * options.TSC_MODULE_OPTIONS.length
        * options.NODE_EXEC_OPTIONS.length
    );
    console.log(`Running ${testCount} test cases:`)
    for (const js of options.JS_EXPORT_DEFAULT_STATEMENTS) {
        for (const dts of options.DTS_EXPORT_DEFAULT_STATEMENTS) {
            for (const ts of options.TS_IMPORT_DEFAULT_STATEMENTS) {
                for (const tscTargetOption of options.TSC_TARGET_OPTIONS) {
                    for (const tscModuleInterop of options.TSC_MODULE_INTEROP_OPTIONS) {
                        for (const tscOptsOut of options.TSC_MODULE_OPTIONS) {
                            for (const nodeOpts of options.NODE_EXEC_OPTIONS) {
                                const t0 = Date.now();

                                // Prepare the test case.
                                const testCase = {
                                    "id": rows.length + 1,
                                    "js": js,
                                    "dts": dts,
                                    "ts": ts,
                                    "tsc-target": tscTargetOption,
                                    "tsc-module-interop": tscModuleInterop,
                                    "tsc-module": tscOptsOut,
                                    "node-opts": nodeOpts
                                };
                                const testCaseName = JSON.stringify(testCase);

                                // Run the test case.
                                const row = runTestCase(testCase);
                                // Append the test case the the list.
                                rows.push(row);

                                // Display the result.
                                const minutesRemaining = ((testCount - rows.length) * (Date.now() - T0) / rows.length / 60000).toFixed(2);
                                const minutesAtEnd = (testCount * (Date.now() - T0) / rows.length / 60000).toFixed(1);
                                console.log(`>>> ${row.result}: ${testCaseName} (${Date.now() - t0} ms, ${minutesRemaining}/${minutesAtEnd} minutes remaining)`);
                            }
                        }
                    }
                }
            }
        }
    }
    console.log(`${rows.length} test cases executed in ${((Date.now() - T0) / 60000).toFixed(1)} minutes`);
    return rows;
}

function runTestCase(testCase: TestCase): TestCase {
    const outDir = path.join(MAIN_OUTDIR, `${testCase.id}`.padStart(5, "0"));
    testCase.result = "FAIL";
    testCase.error = "Uncaught error";

    // Execute the test case.
    try {
        // Ensure the output directory exists.
        fs.mkdirpSync(outDir);
        // Save the test case configuration.
        fs.writeFileSync(
            path.join(outDir, "testCase.json"),
            JSON.stringify(testCase, null, 2)
        );
        // Prepare the .js file.
        const exportDefaultStatement1 = testCase["js"].split("\n")[0] || "";
        const exportDefaultStatement2 = testCase["js"].split("\n")[1] || "";
        fs.writeFileSync(
            path.join(PROJECT_DIR, "dist", "my-module.js"),
            fs.readFileSync(path.join(PROJECT_DIR, "test", "my-module.js.in")).toString()
                .replace("${exportDefaultStatement1}", exportDefaultStatement1)
                .replace("${exportDefaultStatement2}", exportDefaultStatement2)
        );
        fs.copyFileSync(path.join(PROJECT_DIR, "dist", "my-module.js"), path.join(outDir, "my-module.js"));
        // Prepare the .d.ts file.
        fs.writeFileSync(
            path.join(PROJECT_DIR, "dist", "typings.d.ts"),
            fs.readFileSync(path.join(PROJECT_DIR, "test", "typings.d.ts.in")).toString()
                .replace("${exportDefaultStatement}", testCase["dts"])
        );
        fs.copyFileSync(path.join(PROJECT_DIR, "dist", "typings.d.ts"), path.join(outDir, "typings.d.ts"));
        // Prepare the user .ts file.
        fs.writeFileSync(
            path.join(PROJECT_DIR, "dist", "user.ts"),
            fs.readFileSync(path.join(PROJECT_DIR, "test", "user.ts.in")).toString()
                .replace("${importDefaultStatement}", testCase["ts"])
        );
        fs.copyFileSync(path.join(PROJECT_DIR, "dist", "user.ts"), path.join(outDir, "user.ts"));
    }
    catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }

    // Compile the user .ts against the given .d.ts.
    const tscProcess = new SubProcess("node", TSC_BIN_SCRIPT);
    if (testCase["tsc-target"]) {
        tscProcess.addOptions(...testCase["tsc-target"].split(" "));
    }
    if (testCase["tsc-module-interop"]) {
        tscProcess.addOptions(...testCase["tsc-module-interop"].split(" "));
    }
    if (testCase["tsc-module"]) {
        tscProcess.addOptions(...testCase["tsc-module"].split(" "));
    }
    tscProcess.addOptions(path.join(PROJECT_DIR, "dist", "user.ts"));
    const tscRes = tscProcess.run();
    if (tscRes !== 0) {
        testCase.error = `Compilation failure: status=${tscRes}`;
        testCase.error += `\n---\n${tscProcess.stdout()}`;
        testCase.error += `\n---\n${tscProcess.stderr()}`;
        try {
            fs.writeFileSync(path.join(outDir, "error.log"), testCase.error);
        }
        catch (err) {
            console.error(`${err}`);
            process.exit(1);
        }
        return testCase;
    }
    try {
        fs.copyFileSync(path.join(PROJECT_DIR, "dist", "user.js"), path.join(outDir, "user.js"));
    }
    catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }

    // Execute the user .js with the given .js module and node options.
    const nodeProcess = new SubProcess("node");
    if (testCase["node-opts"]) {
        nodeProcess.addOptions(...testCase["node-opts"].split(" "));
    }
    nodeProcess.addOptions(path.join(PROJECT_DIR, "dist", "user.js"));
    const nodeRes = nodeProcess.run();
    if (nodeRes !== 0) {
        testCase.error = `Execution failure: status=${nodeRes}`;
        testCase.error += `\n---\n${nodeProcess.stdout()}`;
        testCase.error += `\n---\n${nodeProcess.stderr()}`;
        try {
            fs.writeFileSync(path.join(outDir, "error.log"), testCase.error);
        }
        catch (err) {
            console.error(`${err}`);
            process.exit(1);
        }
        return testCase;
    }

    // If the execution succeeded, ensure the 'Hello A!' has been printed out as expected.
    if (! nodeProcess.stdout().includes("Hello A!")) {
        console.error(`Execution failure: status=${nodeRes}`);
        console.error(`---\n${nodeProcess.stdout()}`);
        console.error(`---\n${nodeProcess.stderr()}`);
        process.exit(1);
    }

    testCase.result = "PASS";
    testCase.error = undefined;
    return testCase;
}

async function writeCsv(csvOutFile: string, rows: TestCase[]) {
    console.log(`Writing results to '${csvOutFile}'`);
    const csvDoc = csvWriter.createObjectCsvWriter({
        path: csvOutFile,
        header: [
            {id: "id", title: "Test case identifier"},
            {id: "js", title: ".js default export statement"},
            {id: "dts", title: ".d.ts default export statement"},
            {id: "ts", title: ".ts default import statement"},
            {id: "tsc-target", title: "TypeScript --target option"},
            {id: "tsc-module-interop", title: "TypeScript --esModuleInterop option"},
            {id: "tsc-module", title: "TypeScript --module option"},
            {id: "node-opts", title: "Node.js execution options"},
            {id: "result", title: "Test case result"},
            {id: "error", title: "Test case error"},
        ],
        fieldDelimiter: ";",
    });
    for (const row of rows) {
        // Hack: insert spaces when the cell start with a '-' character.
        for (const field in row) {
            if (row[field] && row[field].startsWith && row[field].startsWith("-")) {
                row[field] = " " + row[field];
            }
        }
        // Indicate when the `--module` option receives a value by default due to the `--target` option.
        if (row["tsc-target"] && (! row["tsc-module"])) {
            row["tsc-module"] = " (--module=es6)";
        }
    }
    try {
        await csvDoc.writeRecords(rows);
    }
    catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
}

async function main() {
    fs.mkdirpSync(MAIN_OUTDIR);
    const rows = runAllTestCases();
    await writeCsv(path.join(MAIN_OUTDIR, "all-test-cases.csv"), rows);
}

main();
