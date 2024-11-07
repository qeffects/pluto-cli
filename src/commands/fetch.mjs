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
} from "../util.mjs";
import simpleGit from "simple-git";
import { PROJECT_DISPLAY_NAME } from "../constants.mjs";
import { fetchHelp, helpParser } from "../helpStrings.mjs";
import minimist from "minimist";

export const fetchCommand = async () => {
    const argv = minimist(process.argv.slice(3));
    if (helpParser(argv, fetchHelp)){
        return;
    };
    PlutoHello("fetch");

    const appDataFolder = GetAppData();

    const hasAppData = await HasAppData();

    let moduleMap = {
        availablePackages: [],
        cachedPackages: [],
        packageToFolderMap: {},
        folderToPackageMap: {},
    };
    if (!hasAppData) {
        await CreateAppData();
        await fs.writeFile(
            appDataFolder + "/moduleMap.json",
            JSON.stringify(moduleMap),
            "utf8"
        );
        PlutoSuccess(
            `Creating appdata cache folder for ${PROJECT_DISPLAY_NAME}: ${chalk.green(
                appDataFolder
            )}`
        );
    } else {
        PlutoLog("Info", `Existing appdata cache found!`);
        const moduleMapJson = await fs.readFile(
            appDataFolder + "/moduleMap.json"
        );
        moduleMap = JSON.parse(moduleMapJson);
    }

    const git = simpleGit(appDataFolder + "/metadata");

    try {
        await fs.access(appDataFolder + "/metadata/README.md");
    } catch (c) {
        await git.clone(
            "https://github.com/qeffects/pluto-packages.git",
            appDataFolder + "/metadata"
        );
        PlutoSuccess(`Cloned remote git repo (pluto-packages)`);
    }

    await git.fetch();
    await git.pull();
    PlutoLog(
        "Info",
        `Remote changes fetched and pulled (only manifests loaded)`
    );

    console.log();

    const packageList = await fs.readdir(appDataFolder + "/metadata/packages");

    PlutoLog("Remote package list");

    console.log(packageList);

    for (let index = 0; index < packageList.length; index++) {
        const v = packageList[index];

        const m = await ReadModuleManifest(v);
        const isCachedLocally = !!moduleMap.cachedPackages[v];
        PlutoLog(
            "-",
            chalk.black.blueBright(v),
            `hash: ${chalk.red(m.hash.slice(0, 10))}; size: ${chalk.green(
                Math.round((m.size / 1024) * 100) / 100
            )}KiB; isCached: ${chalk.blue(isCachedLocally)}`
        );

        if (!moduleMap.availablePackages.includes(m.name)) {
            moduleMap.availablePackages.push(m.name);
        }
        moduleMap.packageToFolderMap[m.name] = v;
        moduleMap.folderToPackageMap[v] = m.name;
    }

    await WriteModuleMapping(moduleMap);
};
