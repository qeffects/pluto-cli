import { PlutoHelp } from "./util.mjs";

export const helpParser = (args, helpCommand) => {
    if (args.h) {
        helpCommand();
    }
}

export const addHelp = () => {
    PlutoHelp(``);
}