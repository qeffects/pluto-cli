import chalk from "chalk";
import fs from "node:fs/promises";
import { PlutoError, PlutoHello, PlutoHelp, PlutoLog, PlutoSuccess, ReadModuleManifest, ReadModuleMapping, filterInstalledModules, generateDependencies, generateModuleShorthand, getPlutoLock, getPlutoModule, performModuleInstall } from "../util.mjs";
import { COMMAND_FETCH, LOCK_FILE, MODULE_DIRECTORY, MODULE_MANIFEST_FILENAME } from "../constants.mjs";
import minimist from "minimist";

// update Name updates a specific package
// update no args updates all packages to latest versions

PlutoHello("update");


PlutoLog("Info", "Reading cache...");
let plutoModuleMapping;
try {
    plutoModuleMapping = await ReadModuleMapping();
} catch (e) {
    PlutoError(
        `Couldn't find ${chalk.red("appdata cache")} exiting...`
    );
    console.log(e);
    process.exit(1);
}

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

await fs.rm(`${cwd}/pluto_modules`, {recursive: true, force: true});
await fs.rm(`${cwd}/pluto.lock`, {recursive: true, force: true});

let plutoLock;

const moduleManifest = await ReadModuleMapping();

const {realPackageList, submoduleList, flattenedPackageList} = await generateDependencies(plutoModule, moduleManifest);

const {filteredFlatPackagelist, filteredRealPackages, filteredSubmodules} = filterInstalledModules(realPackageList, submoduleList, flattenedPackageList, plutoLock);

await performModuleInstall(filteredSubmodules, filteredFlatPackagelist, filteredRealPackages, moduleManifest, plutoLock);

