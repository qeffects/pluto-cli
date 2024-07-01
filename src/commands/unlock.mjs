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
import { helpParser, unlockHelp } from "../helpStrings.mjs";

// unlock name
// -t @v1.0 locks to a tag
// -c #123dasd locks to a commit
// no args locks to current commit

export const unlockCommand = async () => {
    const argv = minimist(process.argv.slice(3));
    if (helpParser(argv, unlockHelp)){
        return;
    };
    PlutoHello("unlock");

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

    let argName = argv._[0];

    if (!plutoModule.dependencies[argName]) {
        PlutoError(`Couldn't find ${argName} exiting...`);
        process.exit(1);
    }

    plutoModule.dependencies[argName].latest = true;
    delete plutoModule.dependencies[argName].gitTag;
    delete plutoModule.dependencies[argName].gitCommit;

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
    PlutoHelp(
        `Remember that you have to update your requires now, the package must imported like require(${chalk.green(
            `"${argName}"`
        )})`
    );

    PlutoSuccess("All done.");
};
