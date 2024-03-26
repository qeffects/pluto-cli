import chalk from "chalk";
import fs from "node:fs/promises";
import { PlutoError, PlutoHello, PlutoLog, PlutoSuccess, generateModuleShorthand, getPlutoLock, getPlutoModule } from "../util.mjs";
import { LOCK_FILE, MODULE_DIRECTORY, MODULE_MANIFEST_FILENAME } from "../constants.mjs";
import minimist from "minimist";

// -n Name updates a specific package
// no args updates all packages to latest versions

PlutoHello("update");

PlutoLog("Info", "Reading root module configuration...");
const cwd = process.cwd().replace("\\", "/");
let plutoModule;
try {
    plutoModule = await getPlutoModule();
} catch (e) {
    PlutoError(
        `Couldn't find ${chalk.red(MODULE_MANIFEST_FILENAME)} in ${chalk.green(
            cwd
        )}, exiting...`
    );
    console.log(e);
    process.exit(1);
}

PlutoLog("Info", "Reading lockfile...");
let plutoLock;
try {
    plutoLock = await getPlutoLock();
} catch (e) {
    PlutoError(`No ${LOCK_FILE} found, nothing to be done...`);
    process.exit(1);
}

const argv = minimist(process.argv.slice(2));

let argName;
if (argv._ && argv._[0]) {
    // Update single
    argName = argv._[0];

    if (!plutoModule.dependencies[argName]){
        PlutoError(`Package name not found`);
        process.exit(1);
    }
} else {
    // Update all
}

