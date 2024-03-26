
export const PROJECT_DISPLAY_NAME = "pluto";
export const MODULE_DIRECTORY = `${PROJECT_DISPLAY_NAME}_modules`;

export const LJ20 = "Luajit2.0";
export const LJ21 = "Luajit2.1";
export const LJ21b3 = "Luajit2.1beta3";
export const L5 = "Lua5.0";
export const L51 = "Lua5.1";
export const L52 = "Lua5.2";
export const L53 = "Lua5.3";
export const L54 = "Lua5.4";
export const LUAU = "Luau";

// List is theoretically compatible runtimes to the target 
export const LUA_RUNTIME_TARGET = {
    "*":     ["*",L54,L53,L52,L51,L5,LUAU,LJ20,LJ21,LJ21b3],
    [LJ20]:  ["*",LJ20,LJ21,LJ21b3],
    [LJ21]:  ["*",LJ21,LJ21b3],
    [LJ21b3]:["*",LJ21b3],
    [L5]:    ["*",L54,L53,L52,L51,L5,LUAU,LJ20,LJ21,LJ21b3],
    [L51]:   ["*",L54,L53,L52,L51,LUAU,LJ20,LJ21,LJ21b3],
    [L52]:   ["*",L54,L53,L52],
    [L53]:   ["*",L54,L53],
    [L54]:   ["*",L54],
    [LUAU]:  ["*",LUAU]
}

// Flesh this out, community contributions welcome
export const FRAMEWORKS = {
    "*":     ["*","love12","love11","love10","lapis","gmod","roblox"],
    "love12":["*","love12"],
    "love11":["*","love11"],
    "love10":["*","love10"],
    "lapis": ["*","lapis"],
    "gmod":  ["*","gmod"],
    "roblox":["*","roblox"],
}

// Add more options (or perhaps just MIT-like, open-source restrictive(like GPL?) and proprietary license?)
export const LICENSES = {
    "MIT":"",
    "BSD":"",
    "GPL-3":"",
}

export const ROOT_GIT_REPO = "https://github.com/qeffects/selene-packages.git";

export const MODULE_MANIFEST_FILENAME = "module.json";
export const REQUIRE_PATCH_FILE = `${PROJECT_DISPLAY_NAME}.lua`;
export const README_FILE = "README.md";
export const LOCK_FILE = `${PROJECT_DISPLAY_NAME}.lock`;

export const FORBIDDEN_NAME_CHARS = ["@","#"];

export const COMMAND_HELP = `${PROJECT_DISPLAY_NAME} help`;
export const COMMAND_INSTALL = `${PROJECT_DISPLAY_NAME} install`;
export const COMMAND_ADD = `${PROJECT_DISPLAY_NAME} add`;
export const COMMAND_INSPECT = `${PROJECT_DISPLAY_NAME} inspect`;
export const COMMAND_LOCK = `${PROJECT_DISPLAY_NAME} lock`;
export const COMMAND_LIST = `${PROJECT_DISPLAY_NAME} list`;
export const COMMAND_REMOVE = `${PROJECT_DISPLAY_NAME} remove`;
export const COMMAND_FETCH = `${PROJECT_DISPLAY_NAME} fetch`;
export const COMMAND_UPDATE = `${PROJECT_DISPLAY_NAME} update`;