// Third party packages:
import { yellow, underline, bold } from 'chalk';
const align = require('align-text');
const columnify = require('columnify');
const boxen = require('boxen');

// Interfaces:
import { IDependency } from '../../interfaces/dependency';

// Data files:
import {
    BREAK_LINE,
    BREAK_TWO_LINES,
    STDOUT_ASCII_ART_DATA,
    STDOUT_BULLETINS,
    STDOUT_EXPLANATORY_TITLE,
} from './messages-data';

const DEPENDENCY_NAME = 'name';
const DEPENDENCY_VERSION = 'version';
const COLUMNIFY_ALIGNMENT = 'right';
const COLUMNIFY_CONFIG = {
    columns: [DEPENDENCY_NAME, DEPENDENCY_VERSION],
    config: { version: { align: COLUMNIFY_ALIGNMENT } },
};

function centerAlign(len: number) {
    return Math.floor((process.stdout.columns - len) / 2);
}

function sortDependencies(dependencies: IDependency[]): IDependency[] {
    return dependencies.sort((firstEl, secondEl) =>
        secondEl.name > firstEl.name ? -1 : 1,
    );
}

function outputToCenter(messageDatum: string, isTitle?: boolean): string[] {
    return isTitle
        ? align(underline(messageDatum), centerAlign)
        : align(messageDatum, centerAlign);
}

function logMessage(index: number, messages: any[]): void {
    const startDisplayingMsg = setInterval(() => {
        console.log(messages[index]);
        index++;
        if (index >= messages.length) {
            clearInterval(startDisplayingMsg);
        }
    }, 75);
}

export function displayMsgToStdOut(dependencies: IDependency[]): void {
    const sortedDependencies = sortDependencies(dependencies);
    const columns = columnify(sortedDependencies, COLUMNIFY_CONFIG);

    const stdOutMessages = [
        boxen(columns, { padding: 1 }),
        BREAK_TWO_LINES,
        ...STDOUT_ASCII_ART_DATA.map((asciiDatum) =>
            yellow(outputToCenter(asciiDatum)),
        ),
        BREAK_LINE,
        ...STDOUT_EXPLANATORY_TITLE.map((titleDatum) =>
            yellow(bold(outputToCenter(titleDatum, true))),
        ),
        BREAK_LINE,
        ...STDOUT_BULLETINS.map((bulletinDatum) => yellow(bulletinDatum)),
    ];

    let index: number = 0;
    logMessage(index, stdOutMessages);
}
