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
} from "../util.mjs";
import { simpleGit } from "simple-git";

import minimist from "minimist";

/*const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});*/

const argv = minimist(process.argv.slice(2));
const cwd = process.cwd().replace("\\", "/");

const appDataFolder = GetAppData();

const hasAppData = HasAppData();

if (!hasAppData) {
    PlutoError(`Appdata folder not found, please run ${chalk.bold(COMMAND_FETCH)}`);
    process.exit();
}

const moduleManifest = await ReadModuleMapping();

PlutoHello("install");

let nextPackageList = [];
let currentPackageList = [];

let flattenedPackageList = [];

let realPackageList = [];

let realCurrentPackageList = [];
let realNextPackageList = [];

let loadedModuleManifests = {};
let submoduleList = {};

PlutoLog("Info", "Reading root module configuration...");
let plutoModule;
try {
    plutoModule = JSON.parse(
        await fs.readFile(cwd + "/" + MODULE_MANIFEST_FILENAME)
    );
} catch (e) {
    PlutoError(
        `Couldn't find ${chalk.red(MODULE_MANIFEST_FILENAME)} in ${chalk.green(
            cwd
        )}, exiting...`
    );
    process.exit(1);
}

let plutoLock;
try {
    plutoLock = JSON.parse(await fs.readFile(cwd + "/" + LOCK_FILE));
} catch (e) {
    PlutoLog(`No ${LOCK_FILE} found, assuming fresh install`);
}

let hasMoreDependencies = true;
// First layer of direct dependencies
const dependencyNames = Object.keys(plutoModule.dependencies);
for (let index = 0; index < dependencyNames.length; index++) {
    const modName = dependencyNames[index];

    if (!loadedModuleManifests[modName]) {
        loadedModuleManifests[modName] = await ReadModuleManifest(
            moduleManifest.packageToFolderMap[modName]
        );
    }
    const modM = loadedModuleManifests[modName];

    let name;
    if (plutoModule.dependencies[modName].gitCommit) {
        name = `${modName}#${plutoModule.dependencies[modName].gitCommit}`;
    }
    if (plutoModule.dependencies[modName].gitTag) {
        name = `${modName}@${plutoModule.dependencies[modName].gitTag}`;
    }
    if (plutoModule.dependencies[modName].latest) {
        name = `${modName}`;
    }

    currentPackageList.push(name);

    realCurrentPackageList.push({
        name: modName,
        version: plutoModule.dependencies[modName],
        installedBy: ["root"],
        reverseMap: name,
    });
    realPackageList.push({
        name: modName,
        version: plutoModule.dependencies[modName],
        installedBy: ["root"],
        reverseMap: name,
    });

    flattenedPackageList = currentPackageList;
    submoduleList[modName] = true;
}

PlutoLog("Info", "Direct dependencies:", ...flattenedPackageList);

while (!(currentPackageList.length === 0)) {
    for (let index = 0; index < realCurrentPackageList.length; index++) {
        const modName = realCurrentPackageList[index].name;
        const reverseMap = realCurrentPackageList[index].reverseMap;

        if (!loadedModuleManifests[modName]) {
            loadedModuleManifests[modName] = await ReadModuleManifest(
                moduleManifest.packageToFolderMap[modName]
            );
        }

        const modM = loadedModuleManifests[modName];

        const deps = Object.keys(modM.dependencies);

        for (let index = 0; index < deps.length; index++) {
            const depName = deps[index];

            let newDep;
            if (modM.dependencies[depName].gitCommit) {
                newDep = `${depName}#${modM.dependencies[depName].gitCommit}`;
            }
            if (modM.dependencies[depName].gitTag) {
                newDep = `${depName}@${modM.dependencies[depName].gitTag}`;
            }
            if (modM.dependencies[depName].latest) {
                newDep = `${depName}`;
            }

            if (!flattenedPackageList.includes(newDep)) {
                nextPackageList.push(newDep);
                flattenedPackageList.push(newDep);
                realNextPackageList.push({
                    name: depName,
                    version: modM.dependencies[depName],
                    installedBy: [reverseMap],
                    reverseMap: newDep,
                });
                realPackageList.push({
                    name: depName,
                    version: modM.dependencies[depName],
                    installedBy: [reverseMap],
                    reverseMap: newDep,
                });
                submoduleList[depName] = true;
            } else {
                realPackageList.forEach((v) => {
                    if (v.reverseMap === newDep) {
                        installedBy.push(reverseMap);
                    }
                });
            }
        }
    }
    if (!(nextPackageList.length === 0)) {
        PlutoLog("+", "Next dependency layer: ", ...nextPackageList);
    }
    realCurrentPackageList = realNextPackageList;
    currentPackageList = nextPackageList;

    nextPackageList = [];
    realNextPackageList = [];
}

PlutoLog("Info", "All dependencies resolved, final dependency list:");
PlutoLog("List", flattenedPackageList.join(" ; "));

let filteredRealPackages = realPackageList;
let filteredSubmodules = submoduleList;
let filteredFlatPackagelist = flattenedPackageList;
if (plutoLock) {
    const newFlatPackages = [];
    const newRealPackages = [];
    const newSubmodules = [];

    flattenedPackageList.forEach((v) => {
        if (!plutoLock.flatPackageList.includes(v)) {
            newFlatPackages.push(v);
        }
    });

    realPackageList.forEach((newRP) => {
        let isNewPackage = true;
        plutoLock.realPackageList.forEach((savedRP) => {
            if (newRP.reverseMap === savedRP.reverseMap) {
                newRealPackages.push(newRP);
                isNewPackage = false;
            }
        });
        if (isNewPackage) {
            newRealPackages.push(newRP);
            newSubmodules[newRP.name] = true;
        }
    });

    filteredRealPackages = newRealPackages;
    filteredSubmodules = newSubmodules;
    filteredFlatPackagelist = newFlatPackages;

    PlutoLog(
        "Info",
        "This is an existing installation, filtered out existing packages"
    );
    PlutoLog("List", `New packages: ${filteredFlatPackagelist.join(" ; ")}`);
}

const submodules = Object.keys(filteredSubmodules);

const metadataGit = simpleGit(appDataFolder + "/metadata");

const ignoreDotfiles = (src) => {
    if (src.includes(".git")) {
        return false;
    }
    return true;
};

const commonFolderLog = (folderName) => {
    PlutoSuccess(`Added modules/${chalk.red(folderName)} to project folder!`);
};

const commonCacheLog = (folderName) => {
    PlutoSuccess(
        `Found a cached version of ${chalk.red(folderName)} in appdata!`
    );
};

const commonCacheNotFoundLog = (folderName) => {
    PlutoSuccess(`Cached a copy of ${chalk.red(folderName)} in appdata!`);
};

try {
    await fs.mkdir(`./${MODULE_DIRECTORY}`);
} catch (e) {}

if (!(filteredFlatPackagelist.length === 0)) {
    PlutoLog("Info", "Checking out submodules");
    for (let index = 0; index < submodules.length; index++) {
        // Submodule depots must be left in a clean state after this.
        const submodule = submodules[index];
        const submodFolder = moduleManifest.packageToFolderMap[submodule];
        const currentFolder = `${appDataFolder}/metadata/packages/${submodFolder}/module`;
        await metadataGit.subModule([
            `update`,
            `--init`,
            `--recursive`,
            `./packages/${submodFolder}/module/`,
        ]);
        console.log();
        PlutoLog("Info", `Checked out submodule: ${chalk.red(submodule)}`);
        const smgit = await GetSubmoduleGit(submodFolder);
        // Saving the main branch for later (checkout to this for cleanup)
        const mainBranch = (await smgit.branch()).current;
        const currentCommit = (await smgit.log()).latest.hash;
        if (!moduleManifest.cachedPackages.includes(submodule)) {
            moduleManifest.cachedPackages.push(submodule);
        }

        const operations = [];
        filteredRealPackages.forEach((val) => {
            if (val.name === submodule) {
                if (val.version.latest) {
                    val.version.installedCommit = currentCommit; 
                    operations.unshift({ latest: true, currentPack: val });
                } else {
                    if (val.version.gitTag) {
                        operations.push({ tag: val.version.gitTag, currentPack: val  });
                    } else if (val.version.gitCommit) {
                        operations.push({ commit: val.version.gitCommit, currentPack: val });
                    }
                }
            }
        });

        while (operations.length > 0) {
            const op = operations.shift();
            if (op.latest) {
                await smgit.checkout(["-f", mainBranch]);
                try {
                    await fs.access(
                        `${appDataFolder}/module-cache/${submodule}#${currentCommit}`
                    );
                    commonCacheLog(`${submodule}#${currentCommit}`);
                } catch (e) {
                    commonCacheNotFoundLog(`${submodule}#${currentCommit}`);
                    await fs.mkdir(
                        `${appDataFolder}/module-cache/${submodule}#${currentCommit}`
                    );
                    await fs.cp(
                        currentFolder,
                        `${appDataFolder}/module-cache/${submodule}#${currentCommit}`,
                        { recursive: true, filter: ignoreDotfiles }
                    );
                }
                await fs.cp(
                    `${appDataFolder}/module-cache/${submodule}#${currentCommit}`,
                    `./${MODULE_DIRECTORY}/${submodule}`,
                    { recursive: true, filter: ignoreDotfiles }
                );
                commonFolderLog(submodule);
            } else if (op.tag) {
                await smgit.checkout(["-f", `tags/${op.tag}`]);
                const installedCommit = (await smgit.log()).latest.hash;
                op.currentPack.version.installedCommit = installedCommit;
                try {
                    await fs.access(
                        `${appDataFolder}/module-cache/${submodule}@${op.tag}`
                    );
                    commonCacheLog(`${submodule}@${op.tag}`);
                } catch (e) {
                    commonCacheNotFoundLog(`${submodule}@${op.tag}`);
                    await fs.mkdir(
                        `${appDataFolder}/module-cache/${submodule}@${op.tag}`
                    );
                    await fs.cp(
                        currentFolder,
                        `${appDataFolder}/module-cache/${submodule}@${op.tag}`,
                        { recursive: true, filter: ignoreDotfiles }
                    );
                }
                await fs.cp(
                    `${appDataFolder}/module-cache/${submodule}@${op.tag}`,
                    `./${MODULE_DIRECTORY}/${submodule}@${op.tag}`,
                    { recursive: true, filter: ignoreDotfiles }
                );
                commonFolderLog(`${submodule}@${op.tag}`);
            } else if (op.commit) {
                await smgit.checkout(["-f", `${op.commit}`]);
                const installedCommit = (await smgit.log()).latest.hash;
                op.currentPack.version.installedCommit = installedCommit;
                try {
                    await fs.access(
                        `${appDataFolder}/module-cache/${submodule}#${op.commit}`
                    );
                    commonCacheLog(`${submodule}#${op.commit}`);
                } catch (e) {
                    commonCacheNotFoundLog(`${submodule}#${op.commit}`);
                    await fs.mkdir(
                        `${appDataFolder}/module-cache/${submodule}#${op.commit}`
                    );
                    await fs.cp(
                        currentFolder,
                        `${appDataFolder}/module-cache/${submodule}#${op.commit}`,
                        { recursive: true, filter: ignoreDotfiles }
                    );
                }
                await fs.cp(
                    `${appDataFolder}/module-cache/${submodule}#${op.commit}`,
                    `./${MODULE_DIRECTORY}/${submodule}#${op.commit}`,
                    { recursive: true, filter: ignoreDotfiles }
                );
                commonFolderLog(`${submodule}#${op.commit}`);
            }
        }

        // hopefully reset everything back
        await smgit.checkout(["-f", mainBranch]);
    }
    PlutoSuccess(`Successfully installed all modules`);
    await WriteModuleMapping(moduleManifest);

    if (plutoLock) {
        await fs.writeFile(
            cwd + "/" + LOCK_FILE,
            JSON.stringify(
                {
                    flatPackageList: [
                        ...plutoLock.flatPackageList,
                        ...filteredFlatPackagelist,
                    ],
                    realPackageList: [...filteredRealPackages],
                },
                null,
                4
            )
        );
        PlutoSuccess(`Updated lockfile ${cwd}/${chalk.red(LOCK_FILE)}!`);
    } else {
        await fs.writeFile(
            cwd + "/" + LOCK_FILE,
            JSON.stringify(
                {
                    flatPackageList: [...filteredFlatPackagelist],
                    realPackageList: [...filteredRealPackages],
                },
                null,
                4
            )
        );
        PlutoSuccess(`Added lockfile ${cwd}/${chalk.red(LOCK_FILE)}!`);
    }
} else {
    PlutoLog("Info", "No new packages found, nothing to be done");
}
