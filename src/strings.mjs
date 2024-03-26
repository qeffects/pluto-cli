import chalk from "chalk";
import { MODULE_MANIFEST_FILENAME } from "./constants.mjs";

export const COMPATIBLE_RUNTIME = (target, actual) => `target runtime ${chalk.green(target)} is compatible with ${chalk.blue(actual)}!`;
export const INCOMPATIBLE_RUNTIME = (target, actual) => `${chalk.yellow("Warning:")} target runtime ${chalk.red(target)} is not compatible with ${chalk.blue(actual)}, but you can still try running it!`;
export const INCOMPATIBLE_RUNTIME_SHORT = (target, actual) => `target runtime ${chalk.red(target)} is not compatible with ${chalk.blue(actual)}`;

export const COMPATIBLE_FRAMEWORK = (target, actual) => `target framework ${chalk.green(target.join(","))} is compatible with ${chalk.blue(actual.join(","))}!`;
export const INCOMPATIBLE_FRAMEWORK = (target, actual) => `${chalk.yellow("Warning:")} target framework ${chalk.red(target.join(","))} is not compatible with ${chalk.blue(actual.join(","))}, but you can still try running it!`;
export const INCOMPATIBLE_FRAMEWORK_SHORT = (target, actual) => `target framework ${chalk.red(target.join(","))} is not compatible with ${chalk.blue(actual.join(","))}`;

export const NO_INCOMPATIBILITIES = () => `This module is ${chalk.green("fully compatible")} with your runtime and framework!`;
export const BOTH_INCOMPATIBILE = () => `This module is ${chalk.yellow("incompatible")} with both your runtime and framework!`;

export const INCOMPATIBILITIES = (rt, fr) => `Some modules were filtered out due to incompatiblity due to your runtime (${rt}) or framework (${fr.join(",")}) settings in ${chalk.bold(MODULE_MANIFEST_FILENAME)}`;