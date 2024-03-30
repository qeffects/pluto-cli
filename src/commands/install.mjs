import chalk from "chalk";
import fs from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import {
    COMMAND_FETCH,
    LOCK_FILE,
    MODULE_DIRECTORY,
    MODULE_MANIFEST_FILENAME,
    README_FILE,
    REQUIRE_PATCH_FILE,
} from "../constants.mjs";
import {
    GetAppData,
    GetSubmoduleGit,
    ReadModuleManifest,
    ReadModuleMapping,
    PlutoError,
    PlutoHello,
    PlutoHelp,
    PlutoLog,
    PlutoSuccess,
    WriteModuleMapping,
    HasAppData,
    generateDependencies,
    filterInstalledModules,
    performModuleInstall,
} from "../util.mjs";
import { simpleGit } from "simple-git";

import minimist from "minimist";

/*const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});*/

const argv = minimist(process.argv.slice(2));
const cwd = process.cwd().replace("\\", "/");

const hasAppData = HasAppData();

if (!hasAppData) {
    PlutoError(`Appdata folder not found, please run ${chalk.bold(COMMAND_FETCH)}`);
    process.exit();
}


PlutoHello("install");
PlutoLog("Info", "Reading root module configuration...");
let plutoModule;
try {
    plutoModule = JSON.parse(
        await fs.readFile(cwd + "/" + MODULE_MANIFEST_FILENAME)
    );
} catch (e) {
    PlutoError(
        `Couldn't find ${chalk.red(
            MODULE_MANIFEST_FILENAME
        )} in ${chalk.green(cwd)}, exiting...`
    );
    process.exit(1);
}

let plutoLock;
try {
    plutoLock = JSON.parse(await fs.readFile(cwd + "/" + LOCK_FILE));
} catch (e) {
    PlutoLog("L",`No ${LOCK_FILE} found, assuming fresh install`);
}

const moduleManifest = await ReadModuleMapping();

const {realPackageList, submoduleList, flattenedPackageList} = await generateDependencies(plutoModule, moduleManifest);

const {filteredFlatPackagelist, filteredRealPackages, filteredSubmodules} = filterInstalledModules(realPackageList, submoduleList, flattenedPackageList, plutoLock);

await performModuleInstall(filteredSubmodules, filteredFlatPackagelist, filteredRealPackages, moduleManifest, plutoLock);