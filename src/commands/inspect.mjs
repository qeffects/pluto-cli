import chalk from "chalk";
import fs from "node:fs/promises";
import {
    CreateAppData,
    GetAppData,
    HasAppData,
    ReadModuleManifest,
    PlutoHello,
    PlutoLog,
    PlutoSuccess,
    WriteModuleMapping,
    PlutoError,
    ReadModuleMapping,
    checkFrameworks,
    checkRuntime,
    PlutoHelp,
} from "../util.mjs";
import simpleGit from "simple-git";
import {
    COMMAND_ADD,
    COMMAND_FETCH,
    COMMAND_INSPECT,
    COMMAND_REMOVE,
    MODULE_MANIFEST_FILENAME,
    PROJECT_DISPLAY_NAME,
} from "../constants.mjs";
import minimist from "minimist";
import {
    COMPATIBLE_FRAMEWORK,
    COMPATIBLE_RUNTIME,
    INCOMPATIBLE_FRAMEWORK,
    INCOMPATIBLE_FRAMEWORK_SHORT,
    INCOMPATIBLE_RUNTIME,
    INCOMPATIBLE_RUNTIME_SHORT,
} from "../strings.mjs";
import { helpParser, inspectHelp } from "../helpStrings.mjs";

export const inspectCommand = async () => {
    const argv = minimist(process.argv.slice(3));
    if (helpParser(argv, inspectHelp)){
        return;
    };
    PlutoHello("inspect");

    const cwd = process.cwd().replace("\\", "/");

    const appDataFolder = GetAppData();

    const hasAppData = await HasAppData();

    if (!hasAppData) {
        PlutoError(
            `Appdata folder not found, please run ${chalk.bold(COMMAND_FETCH)}`
        );
        process.exit();
    }

    let plutoModule;
    try {
        plutoModule = JSON.parse(
            await fs.readFile(cwd + "/" + MODULE_MANIFEST_FILENAME)
        );
    } catch (e) {}

    const moduleMap = await ReadModuleMapping();

    // inspect Name searches for a package, if found displays all of it's info
    // inspect Name -c 1dase31f allows to search for a specific comment
    // inspect Name -c lists all available hashes
    // inspect Name -t Tag1.0 allows to search for a tag
    // inspect Name -t lists all available tags

    let argCommit, argTag, argName;
    if (argv._ && argv._[0]) {
        argName = argv._[0];
    } else {
        PlutoError(
            "Please provide a package name like ",
            `${COMMAND_INSPECT} PACKAGENAME`
        );
    }

    if (argv.c) {
        argCommit = argv.c;
    }

    if (argv.t) {
        argTag = argv.t;
    }

    if (!moduleMap.availablePackages.includes(argName.trim())) {
        PlutoError(
            `Module not found, double check the name or try running ${chalk.bold(
                COMMAND_FETCH
            )}`
        );
        process.exit();
    }

    const moduleManifest = await ReadModuleManifest(argName.trim());

    let areFrameworksCompatible, areRuntimesCompatible, hasIncompatibility;
    if (plutoModule) {
        areFrameworksCompatible = checkFrameworks(
            moduleManifest.frameworks,
            plutoModule.frameworks
        );
        areRuntimesCompatible = checkRuntime(
            moduleManifest.runtime,
            plutoModule.runtime
        );
        hasIncompatibility = !(
            areFrameworksCompatible && areRuntimesCompatible
        );
    }

    if (!(argCommit || argTag)) {
        PlutoSuccess(`Module found!\n`);
        PlutoLog(
            "·",
            "Name          |",
            `${chalk.bold.magenta(`${argName}`)} \n`
        );
        PlutoLog(
            "·",
            "Author        |",
            `${chalk.bold.green(moduleManifest.author.name)}`
        );
        if (moduleManifest.author.github) {
            console.log(
                "    GitHub        |",
                `${chalk.underline.cyan(moduleManifest.author.github)}`
            );
        }
        if (moduleManifest.author.email) {
            console.log(
                "    Email         |",
                `${chalk.underline.cyan(moduleManifest.author.email)}`
            );
        }
        console.log();
        PlutoLog(
            "·",
            "License       |",
            `${chalk.blue(moduleManifest.license)}`
        );
        PlutoLog(
            "·",
            "Description   |",
            `${chalk.green(moduleManifest.description)}\n`
        );
        PlutoLog(
            "·",
            "Website       |",
            `${chalk.cyan.underline(moduleManifest.website)}`
        );
        PlutoLog(
            "·",
            "Documentation |",
            `${chalk.cyan.underline(moduleManifest.documentation)}`
        );
        PlutoLog(
            "·",
            "Repository    |",
            `${chalk.cyan.underline(moduleManifest.github)}\n`
        );
        PlutoLog(
            "·",
            "Env           |",
            `Runtime: ${chalk.bold.yellow(
                moduleManifest.runtime
            )} · Frameworks: ${chalk.bold.yellow(
                moduleManifest.frameworks.join(",")
            )}`
        );
        PlutoLog(
            "·",
            "Misc          |",
            `Size: ${chalk.bold(
                Math.round((moduleManifest.size / 1024) * 100) / 100
            )}KiB · Latest Commit: #${chalk.bold(
                moduleManifest.latestCommit.slice(0, 7)
            )} \n`
        );
        PlutoLog("·", "Dependencies  ");
        Object.keys(moduleManifest.dependencies).forEach((v) => {
            let vstr;
            if (moduleManifest.dependencies[v].latest) {
                vstr = chalk.green(`latest`);
            }
            if (moduleManifest.dependencies[v].gitCommit) {
                vstr = chalk.red(
                    `commit: #${moduleManifest.dependencies[v].gitCommit}`
                );
            }
            if (moduleManifest.dependencies[v].gitTag) {
                vstr = chalk.blue(
                    `tag: @${moduleManifest.dependencies[v].gitTag}`
                );
            }
            console.log(
                chalk.blueBright("  *  "),
                chalk.green(v),
                ` · ${vstr}`
            );
        });
        if (plutoModule) {
            console.log();
            PlutoLog("·", "Compatibility");
            if (!areFrameworksCompatible) {
                PlutoError(
                    INCOMPATIBLE_FRAMEWORK_SHORT(
                        moduleManifest.frameworks,
                        plutoModule.frameworks
                    )
                );
            } else {
                PlutoSuccess(
                    COMPATIBLE_FRAMEWORK(
                        moduleManifest.frameworks,
                        plutoModule.frameworks
                    )
                );
            }
            if (!areRuntimesCompatible) {
                PlutoError(
                    INCOMPATIBLE_RUNTIME_SHORT(
                        moduleManifest.runtime,
                        plutoModule.runtime
                    )
                );
            } else {
                PlutoSuccess(
                    COMPATIBLE_RUNTIME(
                        moduleManifest.runtime,
                        plutoModule.runtime
                    )
                );
            }
            if (!areFrameworksCompatible || !areRuntimesCompatible) {
                PlutoHelp("You can still try adding it to your project");
            }
            console.log();
            if (!!plutoModule.dependencies[argName]) {
                PlutoSuccess(
                    "Looks like this module is already added to your project"
                );
                PlutoHelp(
                    `You can remove it by running ${chalk.bold.cyan(
                        `${COMMAND_REMOVE} ${argName}`
                    )}`
                );
            } else {
                PlutoHelp(
                    `You can add this module to your project by running ${chalk.bold.cyan(
                        `${COMMAND_ADD} -n ${argName}`
                    )}`
                );
            }
        }
    } else if (argCommit) {
        if (argCommit === true) {
            PlutoSuccess(`Listing all available commits for ${argName}`);
        } else {
        }
    } else if (argTag) {
        if (argTag === true) {
            PlutoSuccess(`Listing all available tags for ${argName}`);
        } else {
        }
    }
};
