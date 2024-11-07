import chalk from "chalk";
import { COMMAND_ADD, COMMAND_FETCH, COMMAND_HELP, COMMAND_INITIALIZE, COMMAND_INSPECT, COMMAND_LIST, COMMAND_LOCK, COMMAND_REMOVE, COMMAND_UNLOCK, COMMAND_UPDATE } from "./constants.mjs";
import { PlutoHelp } from "./util.mjs";

export const helpParser = (args, helpCommand) => {
    if (args.h) {
        helpCommand();
        return true
    }

    return false
}

const commandName = (cmdName, args) => {
    PlutoHelp(`${chalk.blue.bold(cmdName)} ${chalk.bold(args)}`);
    console.log();
}

const commandDescription = (desc) => {
    console.log(desc);
}

const arg = (arg, desc) => {
    PlutoHelp(`${arg}\t${desc}`);
}

export const addHelp = () => {
    commandName(COMMAND_ADD, `-h -n <Name> -c <Commit> -t <Tag> -l`);
    commandDescription("Adds a new dependency to your current root project");
    arg("-h", "Shows this help prompt");
    arg("-n <Name>", "Bypasses the name prompt, can also compound with a tag or commit like name@tag or name#commitHash");
    arg("-c", "Sets the new dependency to track a commit (find in git or use the pluto inspect <Name> -c command to list them)");
    arg("-t", "Sets the new dependency to track a tag (find in git or use the pluto inspect <Name> -t command to list them)");
    arg("-l", "Sets the new dependency to track the latest commit");
}

export const fetchHelp = () => {
    commandName(COMMAND_FETCH, `-h`);
    commandDescription("Initializes or updates your local module depot(cache)\n Run this whenever you want to update packages to their newest commit or new packages have been added");
    arg("-h", "Shows this help prompt");
}

export const initializeHelp = () => {
    const cwd = process.cwd().replace("\\","/");
    commandName(COMMAND_INITIALIZE, `-h`);
    commandDescription("Initializes your new project directory and a basic file structure skeleton.");  
    arg("-h","Shows help for this command");
    arg("-n <Name>","Skips the name prompt" );
    arg("-c","Initializes the project structure in the current working directory ("+cwd+")" );
}

export const inspectHelp = () => {
    commandName(COMMAND_INSPECT, `<name> -h -t <tag>|-t -c <commit>|-c`);
    commandDescription("Shows all of the information about a module");  
    arg("-h","Shows help for this command");
    arg("-c <commit>","Finds if this package has a commit");
    arg("-c","Lists all of the commits for this module");
    arg("-t <tag>","Finds if this package has a tag" );
    arg("-t","Lists all of the tags for this module" );
}

export const installHelp = () => {
    commandName(COMMAND_UPDATE, ``);
    arg("-h", "Shows help for this command");
    commandDescription("Installs all of your dependencies and their sub dependencies in to your project directory");
}

export const listHelp = () => {
    commandName(COMMAND_LIST, `-i -b -d`);
    commandDescription("List view of all available/installed/dependent modules ");
    arg("-h", "Shows help for this command");
    arg("-i","Lists installed modules");
    arg("-b","Bypasses compatiblity checks");
    arg("-d","Lists dependencies");
    arg("no arguments","Lists modules that are available to be added to your project, including your framework and runtime settings");
}

export const lockHelp = () => {
    commandName(COMMAND_LOCK, `<package> -t <tag> -c <commit>`);
    commandDescription("Locks a dependency to a specific version");
    arg("package","Name of the package to lock");
    arg("-h", "Shows help for this command");
    arg("-t <tag>","Locks a dependency to a specific git tag");
    arg("-c <commit>","Locks a dependency to a specific git commit");
    arg("no arguments","Locks a dependency to the current commit");
}

export const unlockHelp = () => {
    commandName(COMMAND_UNLOCK, ` <package>`);
    arg("package","Name of the package to unlock");
    arg("-h", "Shows help for this command");
    commandDescription("Unlocks a dependency version");
}

export const removeHelp = () => {
    commandName(COMMAND_REMOVE, ` <package>`);
    arg("package","Name of the package to remove");
    arg("-h", "Shows help for this command");
    commandDescription("Removes a package from your dependencies");
}

export const updateHelp = () => {
    commandName(COMMAND_UPDATE, ``);
    arg("-h", "Shows help for this command");
    commandDescription("Updates all of your packages to their latest available versions\n Can also be used to reset pluto_modules and pluto.lock");
}

export const plutoHelp = () => {
    commandName("pluto", `<command>`);
    commandDescription("Use a command together with pluto like 'pluto unlock'");
    commandDescription("List of available commands:");
    arg("init", "Initializes your new project directory and a basic file structure skeleton.");
    arg("add", "Adds a new dependency to your current root project");
    arg("fetch", "Initializes or updates your local module depot(cache)");
    arg("inspect", "Shows all of the information about a module");
    arg("install", "Installs all of your dependencies and their sub dependencies in to your project directory");
    arg("list", "List view of all available/installed/dependent modules ");
    arg("lock", "Locks a dependency to a specific version");
    arg("remove", "Removes a dependency from current project");
    arg("unlock", "Unlocks a dependency version");
    arg("update", "Updates all of your packages to their latest available versions");
}
