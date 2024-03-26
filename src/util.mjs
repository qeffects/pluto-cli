import chalk from "chalk";
import exp from "node:constants";
import fs from "node:fs/promises";
import simpleGit from "simple-git";
import {
    FRAMEWORKS,
    LOCK_FILE,
    LUA_RUNTIME_TARGET,
    MODULE_MANIFEST_FILENAME,
    PROJECT_DISPLAY_NAME,
} from "./constants.mjs";

export function GetAppData() {
    return (
        process.env.APPDATA + `/${PROJECT_DISPLAY_NAME}` ||
        (process.platform == "darwin"
            ? process.env.HOME + `/Library/Preferences/${PROJECT_DISPLAY_NAME}`
            : process.env.HOME + `/.local/share/${PROJECT_DISPLAY_NAME}`)
    ).replace("\\", "/");
}

export async function CreateAppData() {
    let appdata = GetAppData();

    await fs.mkdir(appdata);
    await fs.mkdir(appdata + "/metadata");
    await fs.mkdir(appdata + "/module-cache");
}

export async function HasAppData() {
    let appdata = GetAppData();
    try {
        if (await fs.readdir(appdata)) {
            return true;
        }
    } catch (e) {
        return false;
    }
}

export async function ReadModuleMapping() {
    let appdata = GetAppData();
    const mapping = await fs.readFile(appdata + "/moduleMap.json");

    return JSON.parse(mapping);
}

export async function WriteModuleMapping(val) {
    let appdata = GetAppData();
    await fs.writeFile(
        appdata + "/moduleMap.json",
        JSON.stringify(val, null, 4)
    );
}

export async function ReadModuleManifest(modFolder) {
    let appdata = GetAppData();
    const manifest = await fs.readFile(
        appdata + "/metadata/packages/" + modFolder + "/manifest.json"
    );

    return JSON.parse(manifest);
}

export async function GetSubmoduleGit(modFolder) {
    let appdata = GetAppData();

    return simpleGit(appdata + "/metadata/packages/" + modFolder + "/module/");
}

export function PlutoHello(command) {
    console.log(
        `${chalk.bold.blueBright(`   [${PROJECT_DISPLAY_NAME}]  `)}`,
        chalk.gray(`[${command.trim()}]`)
    );
    console.log(
        `~ ${chalk.italic.blue("The lightweight lua package manager")} ~`
    );
    console.log();
}

export function PlutoLog(cmdName, ...props) {
    console.log(`${chalk.bgBlueBright.black("[" + cmdName + "]")}`, ...props);
}

export function PlutoError(...props) {
    console.log(`${chalk.bgRedBright.black("[X]")} `, ...props);
}

export function PlutoSuccess(...props) {
    console.log(`${chalk.bgGreenBright.black("[✓]")} `, ...props);
}

export function PlutoHelp(...props) {
    console.log(`${chalk.bgGray.white("[i]")} `, ...props);
}

export function checkRuntime(target, real) {
    return LUA_RUNTIME_TARGET[target].includes(real);
}

export function checkFrameworks(target, real) {
    let hits = false;

    target.forEach((t) => {
        real.forEach((v) => {
            if (FRAMEWORKS[t].includes(v)) {
                hits = true;
            }
        });
    });

    return hits;
}

export async function getPlutoModule() {
    const cwd = process.cwd().replace("\\", "/");

    const plutoModule = JSON.parse(
        await fs.readFile(cwd + "/" + MODULE_MANIFEST_FILENAME)
    );

    return plutoModule;
}

export async function getPlutoLock() {
    const cwd = process.cwd().replace("\\", "/");

    const plutoLock = JSON.parse(await fs.readFile(cwd + "/" + LOCK_FILE));

    return plutoLock;
}

export function generateModuleShorthand(mod, modName) {
    let name;
    if (mod.gitCommit) {
        name = `${modName}#${mod.gitCommit}`;
    }
    if (mod.gitTag) {
        name = `${modName}@${mod.gitTag}`;
    }
    if (mod.latest) {
        name = `${modName}`;
    }

    return name;
}