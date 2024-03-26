import chalk from "chalk";
import fs from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { COMMAND_FETCH, COMMAND_LIST, MODULE_MANIFEST_FILENAME, README_FILE, REQUIRE_PATCH_FILE } from "../constants.mjs";
import { GetAppData, ReadModuleManifest, PlutoError, PlutoHello, PlutoHelp, PlutoLog, PlutoSuccess, checkFrameworks, checkRuntime } from "../util.mjs";
import simpleGit from "simple-git";

import minimist from 'minimist';
import { BOTH_INCOMPATIBILE, COMPATIBLE_FRAMEWORK, COMPATIBLE_RUNTIME, INCOMPATIBLE_FRAMEWORK, INCOMPATIBLE_RUNTIME } from "../strings.mjs";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const argv = minimist(process.argv.slice(2));
const cwd = process.cwd().replace("\\","/");

const appDataFolder = GetAppData();

const moduleMapJson = await fs.readFile(appDataFolder+"/moduleMap.json");
let moduleMap = JSON.parse(moduleMapJson);

PlutoHello("add");

let argHelp, argPckgName, argPckgCommit, argPckgTag, argPckgLatest;
if (argv.h){
    argHelp = true;
} 
if (argv.n){
    argPckgName = argv.n;
} else {
    argPckgName = (await rl.question(`Enter the package name: `)).trim();
}
console.log();

// package@tag
if (argPckgName.includes("@")){
    const nameComponents = argPckgName.split("@");
    
    argPckgName = nameComponents[0];
    argPckgTag = nameComponents[1];
}

// package#commit
if (argPckgName.includes("#")){
    const nameComponents = argPckgName.split("#");

    argPckgName = nameComponents[0];
    argPckgCommit = nameComponents[1];
}

if (!moduleMap.availablePackages.includes(argPckgName)){
    PlutoError(`Couldn't find package: ${chalk.red(argPckgName)}! \n Try running ${chalk.bold(COMMAND_FETCH)} to update your local depot\n Or ${chalk.bold(COMMAND_LIST)} to double check the name`);
    process.exit(1);
}

const manifest = await ReadModuleManifest(moduleMap.packageToFolderMap[argPckgName]);
if (argv.c){
    argPckgCommit = argv.c;
}
if (argPckgCommit) {
    let commitExists = false;

    manifest.allCommitHashes.forEach((v) => {
        if (v.startsWith(argPckgCommit)) {
            commitExists = true;
        }
    })

    if (!commitExists) {
        PlutoError(`Couldn't find commit hash ${chalk.red(argPckgCommit)} for ${chalk.green(argPckgName)}, try running ${chalk.bold(COMMAND_FETCH)} to update the local depot or ${chalk.bold(`${COMMAND_INSPECT} ${argPckgName} -c`)} to see the list of available commits`);

        process.exit();
    } else {
        PlutoSuccess(`Found commit ${chalk.red(argPckgCommit)} for ${chalk.green(argPckgName)}!`);
    }
}
if (argv.t){
    argPckgTag = argv.t;
}
if (argPckgTag){
    let tagExists = manifest.tags.includes(argPckgTag);

    if (!tagExists) {
        PlutoError(`Couldn't find tag ${chalk.red(argPckgTag)} for ${chalk.green(argPckgName)}, try running ${chalk.bold(COMMAND_FETCH)} to update the local depot or ${chalk.bold(`${COMMAND_INSPECT} ${argPckgName} -t`)} to see the list of available tags`);
        process.exit();
    } else {
        PlutoSuccess(`Found tag ${chalk.red(argPckgTag)} for ${chalk.green(argPckgName)}!`);
    }
}

if (argv.l||(!argPckgCommit&&!argPckgTag)){
    argPckgLatest = true;
    PlutoLog(`Adding direct dependency`, `${chalk.green(argPckgName)}@${chalk.red("latest")}`);
} else if (argPckgCommit||argPckgTag) {
    PlutoLog(`Adding direct dependency`, `${chalk.green(argPckgName)}${chalk.red(argPckgCommit?"#"+argPckgCommit:"@"+argPckgTag)}`);
}

let plutoModule;
try {
    plutoModule = JSON.parse(await fs.readFile(cwd+"/"+MODULE_MANIFEST_FILENAME));
} catch (e) {
    PlutoError(`Couldn't find ${chalk.red(MODULE_MANIFEST_FILENAME)} in ${chalk.green(cwd)}, exiting...`);
    process.exit(1);
}

const areFrameworksCompatible = checkFrameworks(plutoModule.frameworks, manifest.frameworks);
const areRuntimesCompatible = checkRuntime(plutoModule.runtime, manifest.runtime);

const hasIncompatibility = !(areFrameworksCompatible && areRuntimesCompatible);

if (!areFrameworksCompatible) {
    PlutoError(INCOMPATIBLE_FRAMEWORK(manifest.frameworks, plutoModule.frameworks));
} else {
    PlutoSuccess(COMPATIBLE_FRAMEWORK(manifest.frameworks, plutoModule.frameworks))
}
if (!areRuntimesCompatible) {    
    PlutoError(INCOMPATIBLE_RUNTIME(manifest.runtime, plutoModule.runtime));
} else {
    PlutoSuccess(COMPATIBLE_RUNTIME(manifest.runtime, plutoModule.runtime));
}
if (hasIncompatibility && !argv.b){
    const add = (await rl.question(`Compatibility problem found, add anyways?`)).trim();
    if (!(add.toLowerCase().trim() === 'y')){
        PlutoError(`Aborting package adding...`);
        process.exit();
    }
}

plutoModule.dependencies[argPckgName] = {
    gitTag: argPckgTag,
    gitCommit: argPckgCommit,
    latest: argPckgLatest
}

if (!argPckgTag) {
    delete plutoModule.dependencies[argPckgName].gitTag;
}
if (!argPckgCommit) {
    delete plutoModule.dependencies[argPckgName].gitCommit;
}
if (!argPckgLatest) {
    delete plutoModule.dependencies[argPckgName].latest;
}

await fs.writeFile(cwd+"/"+MODULE_MANIFEST_FILENAME, JSON.stringify(plutoModule, null, 4), "utf8");
PlutoSuccess("Added new dependency to current project!");
rl.close();