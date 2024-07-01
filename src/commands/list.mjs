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
    COMMAND_LIST,
    COMMAND_REMOVE,
    LOCK_FILE,
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
import { helpParser, listHelp } from "../helpStrings.mjs";

export const listCommand = async () => {
    const argv = minimist(process.argv.slice(3));
    if (helpParser(argv, listHelp)){
        return;
    };
    PlutoHello("list");

    const cwd = process.cwd().replace("\\", "/");

    const appDataFolder = GetAppData();

    const hasAppData = await HasAppData();

    const normalizeStr = (str, len) => {
        return str.padEnd(len).slice(0, len);
    };

    let plutoModule;
    try {
        plutoModule = JSON.parse(
            await fs.readFile(cwd + "/" + MODULE_MANIFEST_FILENAME)
        );
    } catch (e) {
        if (argv.i || argv.d) {
            PlutoError(
                `No ${chalk.bold(module.json)} found in ${chalk.green(
                    cwd
                )}, exiting...`
            );
            process.exit(1);
        }
    }
    let plutoLock;
    try {
        plutoLock = JSON.parse(await fs.readFile(cwd + "/" + LOCK_FILE));
    } catch (e) {
        if (argv.i) {
            PlutoError(
                `No ${chalk.bold(LOCK_FILE)} found in ${chalk.green(
                    cwd
                )}, exiting...`
            );
            process.exit(1);
        }
    }

    // -i to list installed packages
    // -b to bypass compatibility checks
    // -d to list dependencies of this package

    if (!hasAppData) {
        PlutoError(
            `Local depot not found, please run ${COMMAND_FETCH} to initialize.`
        );
        process.exit(1);
    }

    const bypassCompCheck = argv.b;
    const renderInstalledModule = (manifest, lock) => {
        let versionStr = "";
        let installedStr = `#${lock.version.installedCommit.slice(0, 8)}`;
        if (lock.version.latest) {
            versionStr = "latest";
        }
        if (lock.version.gitCommit) {
            versionStr = `#${lock.version.gitCommit}`;
        }
        if (lock.version.gitTag) {
            versionStr = `@${lock.version.gitTag}`;
        }
        PlutoLog(
            "-",
            `Name: ${chalk.white.bold(normalizeStr(manifest.name, 35))}`
        );
        PlutoLog("-", `Desc: ${chalk.gray(manifest.description)}`);
        PlutoLog(
            "-",
            chalk.red(normalizeStr(manifest.author.name, 11)),
            chalk.cyan(
                normalizeStr(`#${manifest.latestCommit.slice(0, 8)}`, 15)
            ),
            chalk.yellow(normalizeStr(installedStr, 11)),
            chalk.magenta(normalizeStr(versionStr, 11)),
            chalk.green(normalizeStr(manifest.license, 9)),
            chalk.blue(normalizeStr(lock.installedBy.join(","), 35))
        );
        console.log();
    };

    const renderDependentModule = (manifest, dep) => {
        let versionStr = "";
        if (dep.latest) {
            versionStr = "latest";
        }
        if (dep.gitCommit) {
            versionStr = `#${dep.gitCommit}`;
        }
        if (dep.gitTag) {
            versionStr = `@${dep.gitTag}`;
        }
        PlutoLog(
            "-",
            `Name: ${chalk.white.bold(normalizeStr(manifest.name, 35))}`
        );
        PlutoLog("-", `Desc: ${chalk.gray(manifest.description)}`);
        PlutoLog(
            "-",
            chalk.red(normalizeStr(manifest.author.name, 11)),
            chalk.cyan(
                normalizeStr(`#${manifest.latestCommit.slice(0, 8)}`, 15)
            ),
            chalk.magenta(normalizeStr(versionStr, 11)),
            chalk.green(normalizeStr(manifest.license, 9))
        );
        console.log();
    };

    const renderCompatibleModule = (manifest) => {
        PlutoLog(
            "-",
            `Name: ${chalk.white.bold(normalizeStr(manifest.name, 35))}`
        );
        PlutoLog("-", `Desc: ${chalk.gray(manifest.description)}`);
        PlutoLog(
            "-",
            chalk.red(normalizeStr(manifest.author.name, 11)),
            chalk.cyan(
                normalizeStr(`#${manifest.latestCommit.slice(0, 8)}`, 15)
            ),
            chalk.green(normalizeStr(manifest.license, 9))
        );
        console.log();
    };

    const renderModule = (manifest, framwork, runtime) => {
        PlutoLog(
            "-",
            `Name: ${chalk.white.bold(normalizeStr(manifest.name, 35))}`
        );
        PlutoLog("-", `Desc: ${chalk.gray(manifest.description)}`);
        PlutoLog(
            "-",
            chalk.red(normalizeStr(manifest.author.name, 11)),
            chalk.cyan(
                normalizeStr(`#${manifest.latestCommit.slice(0, 8)}`, 14)
            ),
            chalk.green(normalizeStr(manifest.license, 9)),
            chalk.magenta(
                normalizeStr(
                    `${runtime ? chalk.green("✓ ") : chalk.red("x ")}${
                        manifest.runtime
                    }`,
                    23
                )
            ),
            chalk.yellow(
                normalizeStr(
                    `${
                        framwork ? chalk.green("✓ ") : chalk.red("x ")
                    }${manifest.frameworks.join(",")}`,
                    23
                )
            )
        );
        console.log();
    };

    // name - author - latestHash - license - runtime - envs
    // description
    if (argv.i) {
        PlutoSuccess("Listing installed modules");
        console.log();
        PlutoLog(
            "-",
            `${chalk.black.bgRed("Author    ")}|${chalk.black.bgCyan(
                " Latest Commit "
            )}|${chalk.black.bgYellow(" Installed  ")}|${chalk.black.bgMagenta(
                " Version  "
            )}|${chalk.black.bgGreen(" License ")}|${chalk.black.bgBlue(
                " Installed by            "
            )}`
        );
        for (let index = 0; index < plutoLock.realPackageList.length; index++) {
            const module = plutoLock.realPackageList[index];
            const modM = await ReadModuleManifest(module.name);

            renderInstalledModule(modM, module);
        }
        PlutoHelp(
            `You can remove a module by running ${chalk.bold.cyan(
                `${COMMAND_REMOVE} <name>`
            )}`
        );
    } else if (argv.d) {
        PlutoSuccess("Listing direct dependencies");
        console.log();
        PlutoLog(
            "-",
            `${chalk.black.bgRed("Author    ")}|${chalk.black.bgCyan(
                " Latest Commit "
            )}|${chalk.black.bgMagenta(
                " Target version "
            )}|${chalk.black.bgGreen(" License ")}`
        );
        const depKeys = Object.keys(plutoModule.dependencies);
        for (let index = 0; index < depKeys.length; index++) {
            const module = depKeys[index];
            const modM = await ReadModuleManifest(module);

            renderDependentModule(modM, plutoModule.dependencies[module]);
        }
        PlutoHelp(
            `You can remove a module by running ${chalk.bold.cyan(
                `${COMMAND_REMOVE} <name>`
            )}`
        );
    } else {
        if (!bypassCompCheck) {
            PlutoSuccess("Listing available compatible modules");
            console.log();
            PlutoLog(
                "-",
                `${chalk.black.bgRed("Author    ")}|${chalk.black.bgCyan(
                    " Latest Commit "
                )}|${chalk.black.bgGreen(" License ")}`
            );
            const map = await ReadModuleMapping();

            for (let index = 0; index < map.availablePackages.length; index++) {
                const module = map.availablePackages[index];
                const modM = await ReadModuleManifest(module);

                if (
                    checkRuntime(modM.runtime, plutoModule.runtime) &&
                    checkFrameworks(modM.frameworks, plutoModule.frameworks)
                ) {
                    renderCompatibleModule(modM);
                }
            }

            PlutoHelp(
                `You can add a module to the current project by running ${chalk.bold.cyan(
                    `${COMMAND_ADD} -n <name>`
                )}`
            );
            PlutoHelp(
                `If you want to see ALL available modules, run ${chalk.bold.cyan(
                    `${COMMAND_LIST} -b`
                )}`
            );
        } else {
            PlutoSuccess("Listing all available modules");
            console.log();

            PlutoLog(
                "-",
                `${chalk.black.bgRed("Author    ")}|${chalk.black.bgCyan(
                    " Latest Commit "
                )}|${chalk.black.bgGreen(" License ")}|${chalk.black.bgMagenta(
                    " Runtime    "
                )}|${chalk.black.bgYellow(" Frameworks ")}`
            );
            const map = await ReadModuleMapping();

            for (let index = 0; index < map.availablePackages.length; index++) {
                const module = map.availablePackages[index];
                const modM = await ReadModuleManifest(module);
                const runtime = checkRuntime(modM.runtime, plutoModule.runtime);
                const framework = checkFrameworks(
                    modM.frameworks,
                    plutoModule.frameworks
                );

                renderModule(modM, framework, runtime);
            }

            PlutoHelp(
                `You can add a module to the current project and bypass compatibility checks by running ${chalk.bold.cyan(
                    `${COMMAND_ADD} -b -n <name>`
                )}`
            );
        }
    }

    PlutoHelp(
        `To view more info about a specific module run ${chalk.bold.cyan(
            `${COMMAND_INSPECT} <name>`
        )}`
    );
};
