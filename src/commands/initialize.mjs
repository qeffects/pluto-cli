import chalk from "chalk";
import fs from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { MODULE_MANIFEST_FILENAME, PROJECT_DISPLAY_NAME, README_FILE, REQUIRE_PATCH_FILE } from "../constants.mjs";
import { PlutoHello, PlutoHelp, PlutoLog, PlutoSuccess } from "../util.mjs";
import module from "../staticFiles/module.mjs";
import README from "../staticFiles/README.mjs";
import { luaPatch } from "../staticFiles/luaPatch.mjs";

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
const cwd = process.cwd().replace("\\","/");

PlutoHello("initialize "+process.argv.slice(2));

if (argv.h) {
  PlutoHelp(chalk.whiteBright(`${PROJECT_DISPLAY_NAME} initialize `)+chalk.gray("[-h -c -n Name]") ,"Will initialize your new project directory and a basic file structure skeleton.");
  PlutoHelp("Arguments:");
  PlutoHelp(" [-h] Shows help for this command");
  PlutoHelp(" [-n name] Skips the name prompt" );
  PlutoHelp(" [-c] Initializes the project structure in the current working directory ("+cwd+")" );
  process.exit();
}

let pckgName;
if (argv.n) {
  pckgName = argv.n;
}

let initInPlace;
if (argv.c) {
  initInPlace = true;
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

PlutoLog("Start:",`Initializing a new ${PROJECT_DISPLAY_NAME} module...`);

if (!pckgName){
  pckgName = await rl.question(`\nEnter the name of the project: `);
}

let confirm; 
if (!initInPlace) {
  confirm = await rl.question(`\nWill create a new folder: ${cwd}/${chalk.greenBright(pckgName)}/, continue? [y/n]: `);
} else {
  confirm = await rl.question(`\nWill initialize a new ${PROJECT_DISPLAY_NAME} project in this directory: ${cwd}/, continue? [y/n]: `);
}

rl.close();
if (!(confirm === 'y')) {
  process.exit();
}
console.log();
if (!initInPlace) {
  await fs.mkdir(cwd+`/${pckgName}`);
  PlutoSuccess("Created directory: ", `${chalk.redBright(cwd)}/${chalk.greenBright(pckgName)}`);
}

let manifestFilePath = `${cwd}/${pckgName}/${MODULE_MANIFEST_FILENAME}`
let manifestFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.greenBright(pckgName)}/${chalk.cyanBright(MODULE_MANIFEST_FILENAME)}`;
let patchFilePath = `${cwd}/${pckgName}/${REQUIRE_PATCH_FILE}`
let patchFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.greenBright(pckgName)}/${chalk.cyanBright(REQUIRE_PATCH_FILE)}`;
let readmeFilePath = `${cwd}/${pckgName}/${README_FILE}`
let readmeFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.greenBright(pckgName)}/${chalk.cyanBright(README_FILE)}`;

if (initInPlace) {
  manifestFilePath = `${cwd}/${MODULE_MANIFEST_FILENAME}`
  manifestFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.cyanBright(MODULE_MANIFEST_FILENAME)}`;
  patchFilePath = `${cwd}/${REQUIRE_PATCH_FILE}`
  patchFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.cyanBright(REQUIRE_PATCH_FILE)}`;
  readmeFilePath = `${cwd}/${README_FILE}`
  readmeFileMsg = "Created file: "+`${chalk.redBright(cwd)}/${chalk.cyanBright(README_FILE)}`;
}

const fileHandle = await fs.open(manifestFilePath, "w");
PlutoSuccess(manifestFileMsg);

await fileHandle.writeFile(module(pckgName));
await fileHandle.sync();
await fileHandle.close();

const fileHandle2 = await fs.open(patchFilePath, "w");
PlutoSuccess(patchFileMsg);

await fileHandle2.writeFile(luaPatch(pckgName));
await fileHandle2.sync();
await fileHandle2.close();

const fileHandle3 = await fs.open(readmeFilePath, "w");
PlutoSuccess(readmeFileMsg);

await fileHandle3.writeFile(README(pckgName));
await fileHandle3.sync();
await fileHandle3.close();

PlutoSuccess(`Barebones project setup!`);
console.log();
PlutoLog("Info",`For next steps run: ${chalk.bgGray.whiteBright(` ${PROJECT_DISPLAY_NAME} help `)} `);