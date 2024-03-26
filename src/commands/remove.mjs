import chalk from "chalk";
import fs from "node:fs/promises";
import { PlutoError, PlutoHello, PlutoLog, PlutoSuccess, generateModuleShorthand, getPlutoLock, getPlutoModule } from "../util.mjs";
import { LOCK_FILE, MODULE_DIRECTORY, MODULE_MANIFEST_FILENAME } from "../constants.mjs";
import minimist from "minimist";


// remove name
// remove name -o no recursive removals

PlutoHello("remove");

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

PlutoLog("Info", "Reading lockfile...");
let plutoLock;
try {
    plutoLock = await getPlutoLock();
} catch (e) {
    PlutoError(`No ${LOCK_FILE} found, nothing to be done...`);
    process.exit(1);
}

const argv = minimist(process.argv.slice(2));

let argName;
if (argv._ && argv._[0]) {
    argName = argv._[0];
} else {
    PlutoError(`No package name provided, nothing to be done...`);
    process.exit(1);
}

if (!plutoModule.dependencies[argName]){
    PlutoError(`Package name not found`);
    process.exit(1);
}

const moduleShorthand = generateModuleShorthand(plutoModule.dependencies[argName], argName);

if (!plutoLock.flatPackageList.includes(moduleShorthand)) {
    PlutoError(`Package not installed, nothing to remove`);
    process.exit(0);
}
console.log();
PlutoLog("L", `Removing module: ${chalk.blue(moduleShorthand)}...`);
let packagesToRemove = [moduleShorthand];
let removedFolders = [];

delete plutoModule.dependencies[argName];

while (packagesToRemove.length>0) {
    //First remove the queued packages
    for (let index = 0; index < packagesToRemove.length; index++) {
        const packageName = packagesToRemove[index];
        
        plutoLock.flatPackageList = plutoLock.flatPackageList.filter((v)=>{
            return v !== packageName;
        });
        
        plutoLock.realPackageList = plutoLock.realPackageList.filter((v) => {
            return v.reverseMap !== packageName; 
        });

        plutoLock.realPackageList.map((v, i) => {
            v.installedBy = v.installedBy.filter((v) => v !== packageName);
            return v;
        });

        removedFolders.push(packageName);
        plutoLock.flatPackageList = plutoLock.flatPackageList.filter((v) => {
            return v !== packageName; 
        })
    }

    packagesToRemove = [];

    //Search for packages that now have an empty "installedBy", add to packagesToRemove
    plutoLock.realPackageList.forEach((v) => {
        if (v.installedBy.length===0) {
            packagesToRemove.push(v.reverseMap);
        }
    });
    PlutoLog("L", `Found more modules to remove: ${chalk.blue(packagesToRemove.join(", "))}`);
}

PlutoLog("L", `Complete list: ${chalk.bold(removedFolders.join(", "))}`);
console.log();
for (let index = 0; index < removedFolders.length; index++) {
    const folderName = removedFolders[index];
    
    await fs.rm(`${cwd}/${MODULE_DIRECTORY}/${folderName}`, {recursive: true, force: true});
    PlutoLog("L", `Removed folder ${`${cwd}/${MODULE_DIRECTORY}/${chalk.green(folderName)}`}`);
}

console.log();
await fs.writeFile(
    cwd + "/" + LOCK_FILE,
    JSON.stringify(
        plutoLock,
        null,
        4
    )
);
PlutoSuccess(`Updated lockfile ${cwd}/${chalk.green(LOCK_FILE)}`);

await fs.writeFile(
    cwd + "/" + MODULE_MANIFEST_FILENAME,
    JSON.stringify(
        plutoModule,
        null,
        4
    )
);
PlutoSuccess(`Updated module definition ${cwd}/${chalk.green(MODULE_MANIFEST_FILENAME)}`);

PlutoSuccess("All done.");