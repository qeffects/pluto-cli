import chalk from "chalk";
import fs from "node:fs/promises";
import {
    PlutoError,
    PlutoHello,
    PlutoHelp,
    PlutoLog,
    PlutoSuccess,
    ReadModuleManifest,
    ReadModuleMapping,
    filterInstalledModules,
    generateDependencies,
    generateModuleShorthand,
    getPlutoLock,
    getPlutoModule,
    performModuleInstall,
} from "../util.mjs";
import {
    COMMAND_FETCH,
    COMMAND_UPDATE,
    LOCK_FILE,
    MODULE_DIRECTORY,
    MODULE_MANIFEST_FILENAME,
} from "../constants.mjs";
import minimist from "minimist";
import { helpParser, lockHelp } from "../helpStrings.mjs";

// lock name
// -t @v1.0 locks to a tag
// -c #123dasd locks to a commit
// no args locks to current commit
export const lockCommand = async () => {
    const argv = minimist(process.argv.slice(3));
    if (helpParser(argv, lockHelp)){
        return;
    };
    PlutoHello("lock");

    let argName = argv._[0];
    let argTag = argv.t;
    let argCommit = argv.c;

    PlutoLog("Info", "Reading root module configuration...");
    const cwd = process.cwd().replace("\\", "/");
    let plutoModule;
    try {
        plutoModule = await getPlutoModule();
    } catch (e) {
        PlutoError(
            `Couldn't find ${chalk.red(
                MODULE_MANIFEST_FILENAME
            )} in ${chalk.green(cwd)}, exiting...`
        );
        console.log(e);
        process.exit(1);
    }

    if (!plutoModule.dependencies[argName]) {
        PlutoError(`Couldn't find ${argName} exiting...`);
        process.exit(1);
    }

    const modManifest = await ReadModuleManifest(argName);

    let isCommitFound = false;
    if (argCommit) {
        modManifest.allCommitHashes.forEach((v) => {
            if (v.startsWith(argCommit)) {
                isCommitFound = true;
            }
        });
    }

    if (argCommit && isCommitFound) {
        delete plutoModule.dependencies[argName].latest;
        delete plutoModule.dependencies[argName].gitTag;
        plutoModule.dependencies[argName].gitCommit = argCommit;
        PlutoHelp(
            `Remember that you have to update your requires now, the package must imported like require(${chalk.green(
                `"${argName}#${argCommit}"`
            )})`
        );
    } else if (argCommit !== undefined) {
        PlutoError(`Couldn't find ${argCommit} in commit history, exiting...`);
        process.exit(1);
    }

    if (argTag && modManifest.tags.includes(argTag)) {
        delete plutoModule.dependencies[argName].latest;
        delete plutoModule.dependencies[argName].gitCommit;
        plutoModule.dependencies[argName].gitTag = argTag;
        PlutoHelp(
            `Remember that you have to update your requires now, the package must imported like require(${chalk.green(
                `"${argName}@${argTag}"`
            )})`
        );
    } else if (argTag !== undefined) {
        PlutoError(`Couldn't find ${argTag} in tags, exiting...`);
        process.exit(1);
    }

    if (!argTag && !argCommit) {
        plutoModule.dependencies[argName].latest = true;
        delete plutoModule.dependencies[argName].gitTag;
        delete plutoModule.dependencies[argName].gitCommit;
        PlutoHelp(
            `Remember that you have to update your requires now, the package must imported like require(${chalk.green(
                `"${argName}"`
            )})`
        );
    }

    await fs.writeFile(
        cwd + "/" + MODULE_MANIFEST_FILENAME,
        JSON.stringify(plutoModule, null, 4)
    );

    PlutoSuccess(
        `Updated module definition ${cwd}/${chalk.green(
            MODULE_MANIFEST_FILENAME
        )}`
    );
    PlutoHelp(
        `For the changes to take place you have to run ${chalk.blue.bold(
            COMMAND_UPDATE
        )} !`
    );
};
