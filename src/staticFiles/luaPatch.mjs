import { MODULE_DIRECTORY } from "../constants.mjs";

export const luaPatch = () => (
    `package.path = package.path..';./${MODULE_DIRECTORY}/?/init.lua;./${MODULE_DIRECTORY}/?.lua'`
);