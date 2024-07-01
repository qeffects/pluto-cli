#!/usr/bin/env node

import minimist from "minimist";
import { plutoHelp } from "./helpStrings.mjs";
import { initCommand } from "./commands/initialize.mjs";
import { addCommand } from "./commands/add.mjs";
import { fetchCommand } from "./commands/fetch.mjs";
import { inspectCommand } from "./commands/inspect.mjs";
import { installCommand } from "./commands/install.mjs";
import { listCommand } from "./commands/list.mjs";
import { lockCommand } from "./commands/lock.mjs";
import { unlockCommand } from "./commands/unlock.mjs";
import { updateCommand } from "./commands/update.mjs";

const argv = minimist(process.argv.slice(2));

if (argv._[0] && typeof argv._[0] == "string") {
    switch (argv._[0]) {
        case "init":
            await initCommand();
            break;
        case "add":
            await addCommand();
            break;
        case "fetch":
            await fetchCommand();
            break;
        case "inspect":
            await inspectCommand();
            break;
        case "install":
            await installCommand();
            break;
        case "list":
            await listCommand();
            break;
        case "lock":
            await lockCommand();
            break;
        case "unlock":
            await unlockCommand();
            break;
        case "update":
            await updateCommand();
            break;

        default:
            break;
    }
} else {
    plutoHelp();
}
